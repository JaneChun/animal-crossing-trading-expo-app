import { onSchedule } from 'firebase-functions/v2/scheduler';
import { db } from '../utils/common';
import { restoreUserPostsAfterSuspension } from '../triggers/reports';

/**
 * 매일 한국 시간 자정에 실행되는 스케줄러 함수
 * 정지 해제된 사용자들의 게시글 복구 처리
 */
export const restoreSuspendedUserPostsScheduler = onSchedule(
	{
		schedule: '0 0 * * *',
		timeZone: 'Asia/Seoul',
	},
	async () => {
		console.log('게시글 복구 스케줄러 시작');

		try {
			const now = new Date();

			// 정지 기간이 만료된 사용자들 조회
			const usersSnapshot = await db
				.collection('Users')
				.where('report.suspendUntil', '<=', now)
				.where('report.suspendUntil', '!=', null)
				.get();

			console.log(`정지 해제 대상 사용자 수: ${usersSnapshot.size}`);

			// 각 사용자의 게시글 복구 처리
			for (const userDoc of usersSnapshot.docs) {
				const userId = userDoc.id;

				// 정지 해제 처리
				await userDoc.ref.update({
					'report.suspendUntil': null,
				});

				// 게시글 복구
				await restoreUserPostsAfterSuspension(userId);

				console.log(`사용자 ${userId} 정지 해제 및 게시글 복구 완료`);
			}

			console.log('게시글 복구 스케줄러 완료');
		} catch (error) {
			console.error('게시글 복구 스케줄러 실행 중 오류:', error);
		}
	},
);
