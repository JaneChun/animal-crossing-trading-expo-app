import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { getKstMidnightAfterDays, handleUserPostsOnSuspension, liftUserSuspension } from '../triggers/reports';
import {
	AppealResult,
	IssueSanctionRequest,
	SanctionDoc,
	SanctionKind,
	SanctionReviewStage,
	ViolationType,
} from '../types/sanction';
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

function parseIssueSanctionRequest(data: IssueSanctionRequest | undefined): IssueSanctionRequest {
	if (!data || !isDocId(data.userId)) {
		throw new HttpsError('invalid-argument', 'userId가 필요합니다.');
	}
	if (!SANCTION_KINDS.includes(data.kind)) {
		throw new HttpsError('invalid-argument', '조치 종류가 올바르지 않습니다.');
	}
	if (!VIOLATION_TYPES.includes(data.violationType)) {
		throw new HttpsError('invalid-argument', '위반 유형이 올바르지 않습니다.');
	}
	if (data.reportId !== undefined && !isDocId(data.reportId)) {
		throw new HttpsError('invalid-argument', 'reportId가 올바르지 않습니다.');
	}

	return {
		userId: data.userId,
		kind: data.kind,
		violationType: data.violationType,
		target: parseSanctionTarget(data.target),
		reportId: data.reportId,
	};
}

const TARGET_MATCH_KEYS = ['collectionName', ...TARGET_ID_KEYS] as const;

/**
 * 조치에 연결할 근거 신고: 같은 피신고자의 미처리 신고 중 고른 신고와 대상이 완전히 같은 것
 * 대상 필드가 없는 프로필 신고는 그 유저의 미처리 프로필 신고끼리 연결된다
 * 같은 글의 댓글처럼 대상이 다른 신고는 연결하지 않고 '검토 필요'에 남긴다. 신고를 고르지 않은 조치('대상 없음')는 신고를 연결하지 않는다
 * 등호 조건 둘로 읽고 대상은 메모리에서 비교한다(복합 인덱스 불필요)
 */
async function findLinkedReportRefs(
	userId: string,
	reportId: string | undefined,
	target: IssueSanctionRequest['target'],
): Promise<FirebaseFirestore.DocumentReference[]> {
	if (!reportId) return [];

	const basisReport = (await db.doc(`Reports/${reportId}`).get()).data();
	if (!basisReport) {
		throw new HttpsError('not-found', '근거 신고를 찾을 수 없습니다.');
	}
	// 다른 유저의 신고나 요청 대상과 다른 신고를 근거로 연결하지 않는다
	const isSameTarget = TARGET_ID_KEYS.every((key) => target?.[key] === basisReport[key]);
	if (basisReport.reporteeId !== userId || !isSameTarget) {
		throw new HttpsError('invalid-argument', '근거 신고가 조치 대상과 맞지 않습니다.');
	}

	const snapshot = await db
		.collection('Reports')
		.where('reporteeId', '==', userId)
		.where('resolved', '==', false)
		.get();

	return snapshot.docs
		.filter((doc) => TARGET_MATCH_KEYS.every((key) => doc.data()[key] === basisReport[key]))
		.map((doc) => doc.ref);
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
 * 고른 신고와 대상이 같은 미처리 신고는 근거 신고로 연결해 함께 처리 완료한다
 * 경고는 유저 확인을 기다리고, 정지는 관리자가 할 일이 없으므로 바로 처리 완료 단계로 둔다
 * @param adminId - 처리 관리자 UID
 * @param data - 조치 요청
 * @returns 생성된 조치 문서 ID
 */
export async function issueSanctionHandler(
	adminId: string,
	data: IssueSanctionRequest | undefined,
): Promise<{ sanctionId: string }> {
	const { userId, kind, violationType, target, reportId } = parseIssueSanctionRequest(data);

	const userRef = db.doc(`Users/${userId}`);
	const targetDocPath = getTargetDocPath(target);
	const [userSnap, targetSnap, linkedReportRefs] = await Promise.all([
		userRef.get(),
		targetDocPath ? db.doc(targetDocPath).get() : Promise.resolve(null),
		findLinkedReportRefs(userId, reportId, target),
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
	const reviewStage: SanctionReviewStage = kind === 'warning' ? 'awaitingUser' : 'done';

	const sanction: SanctionDoc = {
		userId,
		kind,
		violationType,
		...(target ? { target: { ...target, ...(targetSnapshot ? { snapshot: targetSnapshot } : {}) } } : {}),
		reportIds: linkedReportRefs.map((ref) => ref.id),
		adminId,
		status: 'active',
		reviewStage,
		createdAt: Timestamp.fromDate(now),
		suspendUntil: sanctionSuspendUntil,
	};

	const batch = db.batch();
	const sanctionRef = db.collection('Sanctions').doc();
	batch.set(sanctionRef, sanction);
	linkedReportRefs.forEach((reportRef) => {
		batch.update(reportRef, { resolved: true, sanctionId: sanctionRef.id });
	});
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

const APPEAL_REPLY_MAX_LENGTH = 1000;
const APPEAL_RESULTS: AppealResult[] = ['upheld', 'canceled'];

/**
 * 조치를 뺀 뒤 남은 유효 정지로 정지 해제일을 다시 계산한다
 * 관리자 [정지 해제]로 이미 풀린 유저를 다시 정지하지 않도록, 해제일은 앞당기기만 한다
 * @returns 계산 후에도 정지 중이면 true
 */
async function recalculateSuspension(userId: string, excludedSanctionId: string): Promise<boolean> {
	const now = new Date();
	const [userSnap, sanctionsSnap] = await Promise.all([
		db.doc(`Users/${userId}`).get(),
		db.collection('Sanctions').where('userId', '==', userId).get(),
	]);

	const currentSuspendUntil: Timestamp | null | undefined = userSnap.data()?.report?.suspendUntil;
	if (!currentSuspendUntil || currentSuspendUntil.toDate() <= now) return false;

	const remainingSuspendUntil = sanctionsSnap.docs
		.filter((doc) => doc.id !== excludedSanctionId)
		.map((doc) => doc.data() as SanctionDoc)
		.filter((sanction) => sanction.status === 'active' && sanction.kind !== 'warning')
		.map((sanction) =>
			sanction.kind === 'permanent' ? PERMANENT_SUSPEND_UNTIL : sanction.suspendUntil?.toDate(),
		)
		.filter((date): date is Date => !!date && date > now)
		.sort((a, b) => b.getTime() - a.getTime())[0];

	if (!remainingSuspendUntil) {
		await liftUserSuspension(userId);
		return false;
	}
	if (remainingSuspendUntil < currentSuspendUntil.toDate()) {
		await db.doc(`Users/${userId}`).update({
			'report.suspendUntil': Timestamp.fromDate(remainingSuspendUntil),
		});
	}
	return true;
}

/**
 * 조치 취소 시 위반 대상 다시 공개 (hideTarget의 반대)
 * - 게시글: hiddenByAdmin 해제. 작성자가 아직 정지 중이면 숨김 상태는 두고, 정지가 풀릴 때 복구된다
 * - 댓글: hiddenByAdmin 해제 + 댓글 수에 댓글 1 + 숨기지 않은 답글 수를 되돌림
 * - 답글: hiddenByAdmin 해제 + 부모 댓글이 숨겨져 있지 않으면 댓글 수 1을 되돌림
 */
async function unhideTarget(target: SanctionDoc['target'], isUserSuspended: boolean): Promise<void> {
	if (!target?.postId || !target.collectionName) return;

	const postRef = db.doc(`${target.collectionName}/${target.postId}`);
	const batch = db.batch();

	if (target.commentId && target.replyId) {
		const commentRef = postRef.collection('Comments').doc(target.commentId);
		const [replySnap, commentSnap] = await Promise.all([
			commentRef.collection('Replies').doc(target.replyId).get(),
			commentRef.get(),
		]);
		if (!replySnap.exists || replySnap.data()?.hiddenByAdmin !== true) return;

		batch.update(replySnap.ref, { hiddenByAdmin: FieldValue.delete() });
		if (commentSnap.data()?.hiddenByAdmin !== true) {
			batch.update(postRef, { commentCount: FieldValue.increment(1) });
		}
	} else if (target.commentId) {
		const commentRef = postRef.collection('Comments').doc(target.commentId);
		const [commentSnap, repliesSnap] = await Promise.all([
			commentRef.get(),
			commentRef.collection('Replies').get(),
		]);
		if (!commentSnap.exists || commentSnap.data()?.hiddenByAdmin !== true) return;

		const visibleReplyCount = repliesSnap.docs.filter((doc) => doc.data().hiddenByAdmin !== true).length;
		batch.update(commentRef, { hiddenByAdmin: FieldValue.delete() });
		batch.update(postRef, { commentCount: FieldValue.increment(1 + visibleReplyCount) });
	} else {
		const postSnap = await postRef.get();
		const post = postSnap.data();
		if (!post || post.hiddenByAdmin !== true) return;

		const shouldShowPost = post.status === 'hidden' && !isUserSuspended;
		batch.update(postRef, {
			hiddenByAdmin: FieldValue.delete(),
			...(shouldShowPost ? { status: 'active' } : {}),
		});
	}

	await batch.commit();
}

/**
 * 조치 취소: 정지면 해제일을 다시 계산하고, 위반 대상을 다시 공개한 뒤, 상태를 취소로 바꿔 위반 횟수에서 뺀다
 * 상태를 마지막에 바꿔, 중간 단계가 실패해도 관리자가 다시 시도할 수 있게 한다(앞 단계는 다시 실행해도 결과가 같다)
 * @param extraUpdate - 함께 저장할 필드(이의 신청 결과 등)
 */
async function cancelSanction(
	sanctionRef: FirebaseFirestore.DocumentReference,
	sanction: SanctionDoc,
	extraUpdate: Record<string, unknown> = {},
): Promise<void> {
	const isUserSuspended =
		sanction.kind === 'warning'
			? await isUserCurrentlySuspended(sanction.userId)
			: await recalculateSuspension(sanction.userId, sanctionRef.id);
	await unhideTarget(sanction.target, isUserSuspended);

	await sanctionRef.update({ status: 'canceled', reviewStage: 'done', ...extraUpdate });
}

async function isUserCurrentlySuspended(userId: string): Promise<boolean> {
	const suspendUntil: Timestamp | null | undefined = (await db.doc(`Users/${userId}`).get()).data()
		?.report?.suspendUntil;
	return !!suspendUntil && suspendUntil.toDate() > new Date();
}

async function getSanctionOrThrow(
	sanctionId: unknown,
): Promise<{ sanctionRef: FirebaseFirestore.DocumentReference; sanction: SanctionDoc }> {
	if (typeof sanctionId !== 'string' || !sanctionId || sanctionId.includes('/')) {
		throw new HttpsError('invalid-argument', 'sanctionId가 올바르지 않습니다.');
	}
	const sanctionRef = db.doc(`Sanctions/${sanctionId}`);
	const sanction = (await sanctionRef.get()).data() as SanctionDoc | undefined;
	if (!sanction) {
		throw new HttpsError('not-found', '조치를 찾을 수 없습니다.');
	}
	return { sanctionRef, sanction };
}

/**
 * 관리자 이의 신청 결정. 답변을 저장하고, 조치 취소면 조치를 취소한다. 결과는 사용자에게 푸시로 알린다
 * @param data - { sanctionId, result: 'upheld' | 'canceled', reply }
 */
export async function decideAppealHandler(
	data: { sanctionId?: unknown; result?: unknown; reply?: unknown } | undefined,
): Promise<void> {
	const { sanctionRef, sanction } = await getSanctionOrThrow(data?.sanctionId);

	const result = data?.result as AppealResult;
	if (!APPEAL_RESULTS.includes(result)) {
		throw new HttpsError('invalid-argument', '결정이 올바르지 않습니다.');
	}
	const reply = typeof data?.reply === 'string' ? data.reply.trim() : '';
	if (!reply || reply.length > APPEAL_REPLY_MAX_LENGTH) {
		throw new HttpsError('invalid-argument', `답변은 1~${APPEAL_REPLY_MAX_LENGTH}자여야 합니다.`);
	}
	if (sanction.appeal?.status !== 'pending' || sanction.status !== 'active') {
		throw new HttpsError('failed-precondition', '검토 중인 이의 신청이 없습니다.');
	}

	const appealUpdate = {
		'appeal.status': 'reviewed',
		'appeal.result': result,
		'appeal.reply': reply,
		'appeal.repliedAt': Timestamp.now(),
		reviewStage: 'done',
	};

	if (result === 'canceled') {
		await cancelSanction(sanctionRef, sanction, appealUpdate);
	} else {
		await sanctionRef.update(appealUpdate);
	}

	await notifyAppealResult(sanctionRef.id, sanction.userId);
}

/**
 * 관리자 조치 취소(이의 신청 없이). 조치 상세의 [조치 취소]에서 쓴다
 * @param data - { sanctionId }
 */
export async function cancelSanctionHandler(data: { sanctionId?: unknown } | undefined): Promise<void> {
	const { sanctionRef, sanction } = await getSanctionOrThrow(data?.sanctionId);
	if (sanction.status !== 'active') {
		throw new HttpsError('failed-precondition', '이미 취소된 조치입니다.');
	}
	// 이의 신청 검토 중인 조치는 답변과 함께 이의 신청 상세에서 결정한다(검토 중으로 남는 것을 막기 위해)
	if (sanction.appeal?.status === 'pending') {
		throw new HttpsError('failed-precondition', '이의 신청 검토 중인 조치입니다.');
	}
	await cancelSanction(sanctionRef, sanction);
}

/**
 * 이의 신청 결과 푸시. 누르면 문의 내역의 해당 항목으로 간다. 실패해도 결정에는 영향을 주지 않는다
 */
async function notifyAppealResult(sanctionId: string, userId: string): Promise<void> {
	try {
		const pushToken: string | undefined = (await db.doc(`Users/${userId}`).get()).data()?.pushToken;
		if (!pushToken) return;

		await sendPushNotification({
			to: pushToken,
			title: '이의 신청 결과 안내',
			body: '이의 신청 검토가 끝났습니다. 앱에서 내용을 확인해 주세요.',
			data: { url: `animal-crossing-trading-app://inquiry/${sanctionId}` },
		});
	} catch (error) {
		console.error('이의 신청 결과 알림 전송 실패:', error);
	}
}
