import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { getKstMidnightAfterDays, handleUserPostsOnSuspension } from '../triggers/reports';
import { IssueSanctionRequest, SanctionDoc, SanctionKind, ViolationType } from '../types/sanction';
import { db } from '../utils/common';
import { sendPushNotification } from '../utils/pushNotification';

const VIOLATION_TYPES: ViolationType[] = [
	'fraud',
	'externalTrade',
	'personalInfo',
	'abuse',
	'inappropriate',
	'spam',
];
const SANCTION_KINDS: SanctionKind[] = ['warning', 'days7', 'days30', 'permanent'];
const POST_COLLECTIONS = ['Boards', 'Communities'];

const SUSPENSION_DAYS: Partial<Record<SanctionKind, number>> = { days7: 7, days30: 30 };

// 영구 정지는 Users.report.suspendUntil에 아주 먼 날짜를 넣어, 정지 판단·만료 스케줄러를 기간 정지와 같은 방식으로 쓴다
export const PERMANENT_SUSPEND_UNTIL = new Date('9999-12-31T00:00:00+09:00');

const SANCTION_COUNT_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * 최근 90일 유효 조치 수 (취소된 조치 제외)
 * 유저당 조치 수가 적어 userId로만 조회하고 나머지는 메모리에서 거른다(복합 인덱스 불필요)
 * @param userId - 대상 유저 UID
 * @param now - 기준 시각
 */
export async function countRecentActiveSanctions(userId: string, now: Date): Promise<number> {
	const snapshot = await db.collection('Sanctions').where('userId', '==', userId).get();
	const windowStartMs = now.getTime() - SANCTION_COUNT_WINDOW_MS;

	return snapshot.docs
		.map((doc) => doc.data() as SanctionDoc)
		.filter((sanction) => sanction.status === 'active')
		.filter((sanction) => sanction.createdAt.toMillis() >= windowStartMs).length;
}

/**
 * 정책상 권장 조치: 이번 조치를 포함한 최근 90일 위반 횟수 1회 → 경고, 2회 → 7일, 3회 → 30일, 4회 이상 → 영구
 * @param recentActiveCount - 이번 조치를 뺀 최근 90일 유효 조치 수
 */
export function getRecommendedSanctionKind(recentActiveCount: number): SanctionKind {
	const violationCount = recentActiveCount + 1;
	if (violationCount <= 1) return 'warning';
	if (violationCount === 2) return 'days7';
	if (violationCount === 3) return 'days30';
	return 'permanent';
}

/**
 * 관리자 정지 바텀시트용 권장 조치
 * @param userId - 대상 유저 UID
 */
export async function getSanctionRecommendationHandler(
	userId: string,
): Promise<{ recentActiveCount: number; recommendedKind: SanctionKind }> {
	if (!userId || typeof userId !== 'string') {
		throw new HttpsError('invalid-argument', 'userId가 필요합니다.');
	}

	const recentActiveCount = await countRecentActiveSanctions(userId, new Date());
	return { recentActiveCount, recommendedKind: getRecommendedSanctionKind(recentActiveCount) };
}

const TARGET_ID_KEYS = ['postId', 'commentId', 'replyId', 'chatId'] as const;

// 문서 경로에 그대로 들어가므로 '/'로 다른 경로를 만들 수 없는 문자열만 받는다
const isDocId = (value: unknown): value is string =>
	typeof value === 'string' && value.length > 0 && !value.includes('/');

/**
 * 대상 콘텐츠 검증. 정해진 키만 골라 새로 만들어, 요청의 다른 값(snapshot 등)이 조치 문서에 저장되지 않게 한다
 */
function parseSanctionTarget(rawTarget: IssueSanctionRequest['target']): IssueSanctionRequest['target'] {
	if (!rawTarget) return undefined;

	const target: NonNullable<IssueSanctionRequest['target']> = {};
	for (const key of TARGET_ID_KEYS) {
		const value = rawTarget[key];
		if (value === undefined) continue;
		if (!isDocId(value)) {
			throw new HttpsError('invalid-argument', `${key}가 올바르지 않습니다.`);
		}
		target[key] = value;
	}

	if (target.postId) {
		if (!POST_COLLECTIONS.includes(rawTarget.collectionName ?? '')) {
			throw new HttpsError('invalid-argument', '게시글 컬렉션이 올바르지 않습니다.');
		}
		target.collectionName = rawTarget.collectionName;
	}
	if ((target.commentId || target.replyId) && !target.postId) {
		throw new HttpsError('invalid-argument', '댓글·답글 대상에는 postId가 필요합니다.');
	}
	if (target.replyId && !target.commentId) {
		throw new HttpsError('invalid-argument', '답글 대상에는 commentId가 필요합니다.');
	}

	return Object.keys(target).length > 0 ? target : undefined;
}

function parseIssueSanctionRequest(
	data: IssueSanctionRequest | undefined,
): IssueSanctionRequest & { reportIds: string[] } {
	if (!data || !isDocId(data.userId)) {
		throw new HttpsError('invalid-argument', 'userId가 필요합니다.');
	}
	if (!SANCTION_KINDS.includes(data.kind)) {
		throw new HttpsError('invalid-argument', '조치 종류가 올바르지 않습니다.');
	}
	if (!VIOLATION_TYPES.includes(data.violationType)) {
		throw new HttpsError('invalid-argument', '위반 유형이 올바르지 않습니다.');
	}

	const reportIds = data.reportIds ?? [];
	if (!Array.isArray(reportIds) || !reportIds.every(isDocId)) {
		throw new HttpsError('invalid-argument', 'reportIds가 올바르지 않습니다.');
	}

	return {
		userId: data.userId,
		kind: data.kind,
		violationType: data.violationType,
		reportIds,
		target: parseSanctionTarget(data.target),
	};
}

/**
 * 대상 콘텐츠 문서 경로. 답글이면 답글, 댓글이면 댓글, 아니면 게시글. 채팅·프로필이면 null
 */
function getTargetDocPath(target: IssueSanctionRequest['target']): string | null {
	if (!target?.postId || !target.collectionName) return null;

	const postPath = `${target.collectionName}/${target.postId}`;
	if (target.commentId && target.replyId) {
		return `${postPath}/Comments/${target.commentId}/Replies/${target.replyId}`;
	}
	if (target.commentId) return `${postPath}/Comments/${target.commentId}`;
	return postPath;
}

/**
 * 위반 대상 숨김 (관리자 숨김과 같은 필드)
 * - 게시글: status hidden + hiddenByAdmin. 정지 해제·만료 복구에서 제외된다
 *   - 정지로 숨긴 정상 글은 status hidden만, 위반해서 관리자가 숨긴 글은 status hidden + hiddenByAdmin을 가진다
 *   - 둘 다 status hidden이라 목록에서는 똑같이 빠지고, 정지가 풀리면 복구 로직이 hiddenByAdmin 없는 정상 글만 다시 표시한다
 * - 댓글: hiddenByAdmin + 게시글 댓글 수에서 댓글 1 + 답글 수 차감 (앱 setCommentHidden과 같은 계산)
 * - 답글: hiddenByAdmin + 댓글 수 1 차감. 부모 댓글이 이미 숨겨져 있으면 그때 함께 차감됐으므로 빼지 않는다
 * - 채팅: 숨김 기능이 없어 기록만 남긴다
 */
async function hideTarget(
	batch: FirebaseFirestore.WriteBatch,
	target: IssueSanctionRequest['target'],
	targetSnap: FirebaseFirestore.DocumentSnapshot | null,
): Promise<void> {
	if (!target?.postId || !target.collectionName || !targetSnap?.exists) return;

	const postRef = db.doc(`${target.collectionName}/${target.postId}`);

	if (target.commentId && target.replyId) {
		if (targetSnap.data()?.hiddenByAdmin === true) return;

		const parentCommentSnap = await postRef.collection('Comments').doc(target.commentId).get();
		batch.update(targetSnap.ref, { hiddenByAdmin: true });
		if (parentCommentSnap.data()?.hiddenByAdmin !== true) {
			batch.update(postRef, { commentCount: FieldValue.increment(-1) });
		}
		return;
	}

	if (target.commentId) {
		if (targetSnap.data()?.hiddenByAdmin === true) return;

		// 먼저 숨긴 답글은 그때 이미 차감했으므로 세지 않는다
		const repliesSnap = await targetSnap.ref.collection('Replies').get();
		const visibleReplyCount = repliesSnap.docs.filter((doc) => doc.data().hiddenByAdmin !== true).length;
		const hiddenCount = 1 + visibleReplyCount;
		batch.update(targetSnap.ref, { hiddenByAdmin: true });
		batch.update(postRef, { commentCount: FieldValue.increment(-hiddenCount) });
		return;
	}

	if (targetSnap.data()?.status === 'deleted') return;

	batch.update(postRef, { status: 'hidden', hiddenByAdmin: true });
}

/**
 * 조치 대상 유저에게 보내는 푸시 문구
 * 경고는 대상이 채팅이면 비공개 처리가 없으므로 문구를 바꾼다
 */
export function buildSanctionPush(
	kind: SanctionKind,
	target: IssueSanctionRequest['target'],
): { title: string; body: string } {
	if (kind !== 'warning') {
		return {
			title: '계정 이용 제한 안내',
			body: '운영 정책 위반으로 계정 이용이 제한되었습니다. 앱에서 내용을 확인해 주세요.',
		};
	}
	if (!target?.postId) {
		return {
			title: '운영 정책 위반 안내',
			body: '운영 정책 위반으로 경고를 받았습니다. 앱에서 내용을 확인해 주세요.',
		};
	}
	// 경고 화면 제목과 같은 기준: 글은 게시글, 댓글·답글은 댓글
	const targetLabel = target.commentId ? '댓글' : '게시글';
	return {
		title: '운영 정책 위반 안내',
		body: `운영 정책 위반으로 ${targetLabel}이 비공개 처리되었습니다. 앱에서 내용을 확인해 주세요.`,
	};
}

/**
 * 관리자 경고·정지
 * 조치 기록을 남기고 위반 대상을 숨긴다. 정지면 Users.report.suspendUntil을 더 늦은 날로 갱신하고 전체 글을 숨긴다
 * @param adminId - 처리 관리자 UID
 * @param data - 조치 요청
 * @returns 생성된 조치 문서 ID
 */
export async function issueSanctionHandler(
	adminId: string,
	data: IssueSanctionRequest | undefined,
): Promise<{ sanctionId: string }> {
	const { userId, kind, violationType, reportIds, target } = parseIssueSanctionRequest(data);

	const userRef = db.doc(`Users/${userId}`);
	const targetDocPath = getTargetDocPath(target);
	const [userSnap, targetSnap] = await Promise.all([
		userRef.get(),
		targetDocPath ? db.doc(targetDocPath).get() : Promise.resolve(null),
	]);
	if (!userSnap.exists) {
		throw new HttpsError('not-found', '유저를 찾을 수 없습니다.');
	}

	const targetSnapshot = targetSnap?.data();
	// 신고의 reporteeId와 대상 글은 신고자가 따로 적으므로, 다른 유저의 글이 섞여 들어오면 거부한다
	if (targetSnapshot && targetSnapshot.creatorId !== userId) {
		throw new HttpsError('invalid-argument', '대상 콘텐츠의 작성자가 조치 대상 유저와 다릅니다.');
	}

	const now = new Date();
	const suspensionDays = SUSPENSION_DAYS[kind];
	const sanctionSuspendUntil = suspensionDays
		? Timestamp.fromDate(getKstMidnightAfterDays(now, suspensionDays))
		: null;

	const sanction: SanctionDoc = {
		userId,
		kind,
		violationType,
		...(target ? { target: { ...target, ...(targetSnapshot ? { snapshot: targetSnapshot } : {}) } } : {}),
		reportIds,
		adminId,
		status: 'active',
		createdAt: Timestamp.fromDate(now),
		suspendUntil: sanctionSuspendUntil,
	};

	const batch = db.batch();
	const sanctionRef = db.collection('Sanctions').doc();
	batch.set(sanctionRef, sanction);
	await hideTarget(batch, target, targetSnap);

	const userSuspendUntil = kind === 'permanent' ? PERMANENT_SUSPEND_UNTIL : sanctionSuspendUntil?.toDate();
	const isSuspension = !!userSuspendUntil;
	if (userSuspendUntil) {
		// 정지 중 새 정지: 실제 해제일은 더 늦은 쪽을 따른다
		const currentSuspendUntil: Timestamp | null | undefined = userSnap.data()?.report?.suspendUntil;
		const isLaterThanCurrent = !currentSuspendUntil || userSuspendUntil > currentSuspendUntil.toDate();

		if (isLaterThanCurrent) {
			batch.update(userRef, { 'report.suspendUntil': Timestamp.fromDate(userSuspendUntil) });
		}
	}

	await batch.commit();

	if (isSuspension) {
		await handleUserPostsOnSuspension(userId);
	}

	// 푸시 실패는 조치 결과에 영향을 주지 않는다 (조치는 이미 저장됨)
	const pushToken: string | undefined = userSnap.data()?.pushToken;
	if (pushToken) {
		try {
			await sendPushNotification({ to: pushToken, ...buildSanctionPush(kind, target) });
		} catch (error) {
			console.error('조치 알림 전송 실패:', error);
		}
	}

	return { sanctionId: sanctionRef.id };
}
