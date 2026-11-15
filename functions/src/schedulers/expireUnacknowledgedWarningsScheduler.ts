import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getAppealDeadline } from '../sanction/appeal';
import { SanctionDoc } from '../types/sanction';
import { db } from '../utils/common';

/**
 * 이의 신청 기한이 지난 '유저 확인 대기' 경고를 '처리 완료'로 옮긴다
 * 앱을 열지 않아 확인하지 않은 경고도 기한이 지나면 관리자가 할 일이 없다
 */
export async function expireUnacknowledgedWarnings(now: Date): Promise<number> {
	const snapshot = await db.collection('Sanctions').where('reviewStage', '==', 'awaitingUser').get();

	const expiredRefs = snapshot.docs
		.filter((doc) => getAppealDeadline(doc.data() as SanctionDoc).getTime() <= now.getTime())
		.map((doc) => doc.ref);

	// 기한 직전에 들어온 이의 신청이 '답변 필요'로 바꿨으면 덮어쓰지 않는다
	await Promise.all(
		expiredRefs.map((ref) =>
			db.runTransaction(async (transaction) => {
				const current = (await transaction.get(ref)).data() as SanctionDoc | undefined;
				if (current?.reviewStage !== 'awaitingUser') return;

				transaction.update(ref, { reviewStage: 'done' });
			}),
		),
	);

	return expiredRefs.length;
}

/**
 * 매일 한국 시간 자정에 실행되는 스케줄러 함수
 * 확인 기한이 지난 경고를 처리 완료로 옮긴다
 */
export const expireUnacknowledgedWarningsScheduler = onSchedule(
	{
		schedule: '0 0 * * *',
		timeZone: 'Asia/Seoul',
	},
	async () => {
		try {
			const expiredCount = await expireUnacknowledgedWarnings(new Date());
			console.log(`확인 기한이 지난 경고 처리 완료: ${expiredCount}건`);
		} catch (error) {
			console.error('경고 확인 기한 스케줄러 실행 중 오류:', error);
		}
	},
);
