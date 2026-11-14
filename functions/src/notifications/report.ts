import { FieldValue } from 'firebase-admin/firestore';
import { db, truncateText } from '../utils/common';
import { sendPushNotification } from '../utils/pushNotification';

export interface ReportWriteData {
	reporterId: string;
	reporteeId: string;
	collectionName?: string;
	postId?: string;
	commentId?: string;
	replyId?: string;
	chatId?: string;
	category: string;
	detail?: string;
	createdAt?: FirebaseFirestore.Timestamp;
}

// 앱 src/constants/post.ts의 REPORT_CATEGORIES와 같은 값
const REPORT_CATEGORY_KR: Record<string, string> = {
	fraud: '사기',
	abuse: '욕설/비방',
	spam: '광고/도배',
	inappropriate: '음란/부적절 콘텐츠',
	other: '기타',
};

/**
 * 신고 대상 종류 표기
 * @param report - 신고 데이터
 * @returns 게시글 / 댓글 / 채팅 / 프로필
 */
export function getReportTargetLabel(report: ReportWriteData): string {
	if (report.chatId) return '채팅';
	if (report.commentId) return '댓글';
	if (report.postId) return '게시글';
	return '프로필';
}

/**
 * 관리자 푸시 본문: "{유형} · {대상 종류} · {상세 내용 앞 30자}"
 * 상세 내용이 비어 있으면 마지막 구분자와 함께 생략한다
 * @param report - 신고 데이터
 * @returns 푸시 본문
 */
export function buildReportPushBody(report: ReportWriteData): string {
	const categoryLabel = REPORT_CATEGORY_KR[report.category] ?? report.category;
	const targetLabel = getReportTargetLabel(report);
	const detail = report.detail?.trim() ?? '';

	const parts = [categoryLabel, targetLabel];
	if (detail) parts.push(truncateText(detail, 30));

	return parts.join(' · ');
}

/**
 * 신규 신고 또는 재신고(덮어쓰기)인지 판단
 * 재신고는 createdAt을 새로 쓰고, 관리자의 처리 상태 변경은 createdAt을 바꾸지 않는다
 * @param before - 쓰기 전 데이터 (생성이면 undefined)
 * @param after - 쓰기 후 데이터 (삭제면 undefined)
 * @returns 알림을 보낼 신고 쓰기이면 true
 */
export function isNewReportWrite(
	before: ReportWriteData | undefined,
	after: ReportWriteData | undefined,
): boolean {
	if (!after) return false;
	if (!before) return true;

	const beforeMs = before.createdAt?.toMillis();
	const afterMs = after.createdAt?.toMillis();
	return beforeMs !== afterMs;
}

/**
 * 신고 접수 시 관리자 푸시 전송과 채팅방 열람 표시
 * @param reportId - 신고 문서 ID
 * @param report - 신고 데이터
 */
export async function handleReportWritten(
	reportId: string,
	report: ReportWriteData,
): Promise<void> {
	// 관리자 열람 권한의 근거. 규칙이 Chats.reportedAt이 있는 채팅만 관리자 읽기를 허용한다
	// 채팅 문서가 없으면 새로 만들지 않는다 (visibleTo 없는 문서가 생기면 참여자 읽기 규칙이 깨진다)
	if (report.chatId) {
		const chatRef = db.doc(`Chats/${report.chatId}`);
		const chatSnap = await chatRef.get();
		if (chatSnap.exists) {
			await chatRef.update({ reportedAt: FieldValue.serverTimestamp() });
		}
	}

	const adminsSnapshot = await db.collection('Users').where('role', '==', 'admin').get();
	const adminPushTokens = adminsSnapshot.docs
		.map((doc) => doc.data().pushToken as string | undefined)
		.filter((token): token is string => !!token);

	const body = buildReportPushBody(report);

	const results = await Promise.allSettled(
		adminPushTokens.map((to) =>
			sendPushNotification({
				to,
				title: '[관리자] 신고 접수',
				body,
				data: {
					url: `animal-crossing-trading-app://admin/report/${reportId}`,
				},
			}),
		),
	);

	results.forEach((result) => {
		if (result.status === 'rejected') {
			console.error('관리자 신고 알림 전송 실패:', result.reason);
		}
	});
}
