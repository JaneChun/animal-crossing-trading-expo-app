import { Timestamp } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { SanctionDoc } from '../types/sanction';
import { db, truncateText } from '../utils/common';
import { sendPushNotification } from '../utils/pushNotification';

export const APPEAL_MAX_LENGTH = 1000;

const DAY_MS = 24 * 60 * 60 * 1000;
// 경고·영구 정지의 이의 신청 기한(조치일로부터). 기간 정지는 해제일까지
const APPEAL_WINDOW_DAYS = 30;

/**
 * 이의 신청 기한. 기간 정지는 해제 예정일, 경고·영구 정지는 조치일 + 30일
 * 앱 src/utilities/sanction.ts의 getAppealDeadline과 같은 계산
 * @param sanction - 조치 문서
 */
export function getAppealDeadline(sanction: SanctionDoc): Date {
	if (sanction.suspendUntil) return sanction.suspendUntil.toDate();
	return new Date(sanction.createdAt.toMillis() + APPEAL_WINDOW_DAYS * DAY_MS);
}

/**
 * 이의 신청 접수. 조치 1건당 한 번, 기한 안에, 조치 대상 본인만 신청할 수 있다
 * @param uid - 신청자 UID
 * @param data - { sanctionId, content }
 */
export async function submitAppealHandler(
	uid: string | undefined,
	data: { sanctionId?: unknown; content?: unknown } | undefined,
): Promise<void> {
	if (!uid) {
		throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
	}

	const sanctionId = data?.sanctionId;
	if (typeof sanctionId !== 'string' || !sanctionId || sanctionId.includes('/')) {
		throw new HttpsError('invalid-argument', 'sanctionId가 올바르지 않습니다.');
	}

	const content = typeof data?.content === 'string' ? data.content.trim() : '';
	if (!content || content.length > APPEAL_MAX_LENGTH) {
		throw new HttpsError('invalid-argument', `이의 신청 내용은 1~${APPEAL_MAX_LENGTH}자여야 합니다.`);
	}

	const sanctionRef = db.doc(`Sanctions/${sanctionId}`);

	// 두 번 눌러도 한 건만 접수되도록 읽기와 쓰기를 트랜잭션으로 묶는다
	await db.runTransaction(async (transaction) => {
		const snapshot = await transaction.get(sanctionRef);
		const sanctionDoc = snapshot.data() as SanctionDoc | undefined;

		if (!sanctionDoc || sanctionDoc.userId !== uid) {
			throw new HttpsError('not-found', '조치를 찾을 수 없습니다.');
		}
		if (sanctionDoc.status !== 'active') {
			throw new HttpsError('failed-precondition', '취소된 조치에는 이의를 신청할 수 없습니다.');
		}
		if (sanctionDoc.appeal) {
			throw new HttpsError('already-exists', '이미 이의를 신청한 조치입니다.');
		}
		if (getAppealDeadline(sanctionDoc).getTime() <= Date.now()) {
			throw new HttpsError('failed-precondition', '이의 신청 기한이 지났습니다.');
		}

		transaction.update(sanctionRef, {
			appeal: { content, status: 'pending', createdAt: Timestamp.now() },
		});
	});

	await notifyAdminsOfAppeal(sanctionId, content);
}

/**
 * 이의 신청 접수 관리자 푸시. 실패해도 접수 결과에는 영향을 주지 않는다
 */
async function notifyAdminsOfAppeal(sanctionId: string, content: string): Promise<void> {
	try {
		const adminsSnapshot = await db.collection('Users').where('role', '==', 'admin').get();
		const adminPushTokens = adminsSnapshot.docs
			.map((doc) => doc.data().pushToken as string | undefined)
			.filter((token): token is string => !!token);

		const results = await Promise.allSettled(
			adminPushTokens.map((to) =>
				sendPushNotification({
					to,
					title: '[관리자] 이의 신청 접수',
					body: truncateText(content, 30),
					data: { url: `animal-crossing-trading-app://admin/appeal/${sanctionId}` },
				}),
			),
		);
		results.forEach((result) => {
			if (result.status === 'rejected') {
				console.error('관리자 이의 신청 알림 전송 실패:', result.reason);
			}
		});
	} catch (error) {
		console.error(`이의 신청 알림 처리 실패 (${sanctionId}):`, error);
	}
}
