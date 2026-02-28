import { onSchedule } from 'firebase-functions/v2/scheduler';

/**
 * 매일 한국 시간 새벽 4시에 실행되는 스케줄러 함수
 * 삭제된지 30일 지난 게시글 하드 삭제 처리
 */
export const hardDeleteExpiredPostsScheduler = onSchedule(
	{
		schedule: '0 4 * * *',
		timeZone: 'Asia/Seoul',
	},
	async () => {
		console.log('만료된 삭제 게시글 하드 삭제 스케줄러 시작');

		try {
			const db = require('../utils/common').db;
			// Date 객체 생성 및 30일 빼기
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

			const collections = ['Boards', 'Communities'];

			// 삭제된지 30일 지난 게시글 삭제
			for (const collectionName of collections) {
				const snapshot = await db
					.collection(collectionName)
					.where('status', '==', 'deleted')
					.where('deletedAt', '<=', thirtyDaysAgo)
					.get();

				if (snapshot.empty) {
					console.log(`${collectionName} 컬렉션: 삭제할 게시글 없음`);
					continue;
				}

				console.log(`${collectionName}: 하드 삭제 대상 문서 수 ${snapshot.size}개`);

				let currentBatch = db.batch();
				let operationCount = 0;

				for (const doc of snapshot.docs) {
					// 1. Comments 서브컬렉션 조회 및 삭제
					const commentsSnap = await doc.ref.collection('Comments').get();
					for (const commentDoc of commentsSnap.docs) {
						// 2. Replies 서브컬렉션 조회 및 삭제
						const repliesSnap = await commentDoc.ref.collection('Replies').get();
						for (const replyDoc of repliesSnap.docs) {
							currentBatch.delete(replyDoc.ref);
							operationCount++;
							if (operationCount >= 490) {
								// 500 제한 방지
								await currentBatch.commit();
								currentBatch = db.batch();
								operationCount = 0;
							}
						}

						currentBatch.delete(commentDoc.ref);
						operationCount++;
						if (operationCount >= 490) {
							await currentBatch.commit();
							currentBatch = db.batch();
							operationCount = 0;
						}
					}

					// 3. 본 게시글(문서) 삭제
					currentBatch.delete(doc.ref);
					operationCount++;
					if (operationCount >= 490) {
						await currentBatch.commit();
						currentBatch = db.batch();
						operationCount = 0;
					}
				}

				if (operationCount > 0) {
					await currentBatch.commit();
				}

				console.log(`${collectionName} 하드 삭제 완료`);
			}

			console.log('만료된 삭제 게시글 하드 삭제 스케줄러 완료');
		} catch (error) {
			console.error('만료 게시글 하드 삭제 스케줄러 실행 중 오류:', error);
		}
	},
);
