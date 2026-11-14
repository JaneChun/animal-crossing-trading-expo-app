/**
 * reports.ts 모듈 통합 테스트
 * Firebase 에뮬레이터를 사용하여 실제 신고 시스템 전체 플로우를 검증합니다
 */

import { createTestApp } from '../helpers/emulator';

// 테스트용 Firebase 앱 인스턴스 생성 - 공통 헬퍼 활용
const { db, Timestamp } = createTestApp('reports-integration-test');

// common.ts Mock - reports.ts가 테스트용 DB를 사용하도록 함
jest.mock('../../src/utils/common', () => ({
	db,
}));

import {
	handleUserReport,
	liftUserSuspension,
	restoreUserPostsAfterSuspension,
} from '../../src/triggers/reports';

describe('사용자 신고 처리 통합 테스트', () => {
	const reporteeId = 'reported_user_123';
	const reporterId = 'reporter_456';

	beforeEach(async () => {
		await cleanupTestData();
	});

	afterAll(async () => {
		await cleanupTestData();
	});

	describe('handleUserReport 함수', () => {
		describe('기본 신고 처리', () => {
			it('첫 번째 신고 시 사용자 정보에 report 필드가 생성되어야 한다', async () => {
				/**
				 * 시나리오:
				 * 1. 사용자 생성 (report 정보 없음)
				 * 2. 신고 1건 생성
				 * 3. handleUserReport 호출
				 * 4. 사용자의 report 정보 확인
				 */
				// 신고당할 사용자 생성
				await db.collection('Users').doc(reporteeId).set({
					displayName: '신고당한 사용자',
					email: 'reported@test.com',
				});

				// 신고 기록 생성
				const reportData = {
					reporteeId,
					createdAt: Timestamp.now(),
				};

				await db.collection('Reports').add({
					...reportData,
					reporterId,
					category: 'spam',
				});

				// 신고 처리
				await handleUserReport(reportData);

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(reporteeId).get();
				const userData = userDoc.data();

				// total은 해당 사용자가 신고당한 전체 건수를 반영해야 함
				const userReportsSnap = await db
					.collection('Reports')
					.where('reporteeId', '==', reporteeId)
					.get();
				const userTotalReports = userReportsSnap.size;

				expect(userData?.report).toEqual({
					total: userTotalReports,
					recent30Days: 1,
				});
			});

			it('기존 report 정보가 있는 사용자의 신고 시 total이 증가해야 한다', async () => {
				// 기존 report 정보가 있는 사용자 생성
				await db
					.collection('Users')
					.doc(reporteeId)
					.set({
						displayName: '신고당한 사용자',
						report: {
							total: 3,
							recent30Days: 2,
							suspendUntil: null,
							needsAdminReview: false,
						},
					});

				// 신고 기록 생성
				const reportData = {
					reporteeId,
					createdAt: Timestamp.now(),
				};

				await db.collection('Reports').add({
					...reportData,
					reporterId,
					category: 'spam',
				});

				// 신고 처리
				await handleUserReport(reportData);

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(reporteeId).get();
				const userData = userDoc.data();

				expect(userData?.report.total).toBe(4);
				expect(userData?.report.recent30Days).toBe(1); // 새로 계산됨
			});

			it('reporteeId가 없는 신고는 처리하지 않아야 한다', async () => {
				const invalidReportData = {
					reporteeId: '',
					createdAt: Timestamp.now(),
				};

				// 함수가 에러 없이 완료되어야 함
				await expect(
					handleUserReport(invalidReportData),
				).resolves.not.toThrow();
			});

			it('존재하지 않는 사용자에 대한 신고는 처리하지 않아야 한다', async () => {
				const nonExistentUserId = 'non_existent_user';
				const reportData = {
					reporteeId: nonExistentUserId,
					createdAt: Timestamp.now(),
				};

				// 함수가 에러 없이 완료되어야 함
				await expect(handleUserReport(reportData)).resolves.not.toThrow();

				// 사용자 문서가 여전히 존재하지 않는지 확인
				const userDoc = await db
					.collection('Users')
					.doc(nonExistentUserId)
					.get();
				expect(userDoc.exists).toBe(false);
			});
		});

		describe('자동 정지 없음', () => {
			it('최근 신고가 많이 쌓여도 정지되지 않고 집계만 갱신된다', async () => {
				await db.collection('Users').doc(reporteeId).set({
					displayName: '신고당한 사용자',
				});

				// 예전 자동 정지 기준(7일 3건, 30일 7건)을 넘는 최근 신고 8건
				const recentTimestamp = Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
				await Promise.all(
					Array.from({ length: 7 }, (_, i) =>
						db.collection('Reports').add({
							reporteeId,
							reporterId: `reporter_${i}`,
							createdAt: recentTimestamp,
						}),
					),
				);
				const reportData = { reporteeId, createdAt: Timestamp.now() };
				await db.collection('Reports').add({ ...reportData, reporterId: 'reporter_last' });

				await handleUserReport(reportData);

				const userData = (await db.collection('Users').doc(reporteeId).get()).data();
				expect(userData?.report).toEqual({
					total: 1,
					recent30Days: 8,
				});
			});

			it('동시에 들어온 신고도 total에 모두 반영된다', async () => {
				await db.collection('Users').doc(reporteeId).set({
					displayName: '신고당한 사용자',
					report: { total: 2, recent30Days: 2, suspendUntil: null },
				});

				const reportData = { reporteeId, createdAt: Timestamp.now() };
				await Promise.all([handleUserReport(reportData), handleUserReport(reportData)]);

				const userData = (await db.collection('Users').doc(reporteeId).get()).data();
				expect(userData?.report.total).toBe(4);
			});

			it('관리자가 건 정지 기간은 새 신고가 들어와도 그대로 유지된다', async () => {
				const suspendUntil = Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000);
				await db.collection('Users').doc(reporteeId).set({
					displayName: '신고당한 사용자',
					report: { total: 2, recent30Days: 2, suspendUntil },
				});

				const reportData = { reporteeId, createdAt: Timestamp.now() };
				await db.collection('Reports').add({ ...reportData, reporterId });

				await handleUserReport(reportData);

				const userData = (await db.collection('Users').doc(reporteeId).get()).data();
				expect(userData?.report.total).toBe(3);
				expect(userData?.report.suspendUntil.toMillis()).toBe(suspendUntil.toMillis());
			});
		});

		describe('에러 처리', () => {
			it('Reports 컬렉션 쿼리 실패 시 에러를 throw해야 한다', async () => {
				const consoleErrorSpy = jest
					.spyOn(console, 'error')
					.mockImplementation(() => {});

				// 신고당할 사용자 생성
				await db.collection('Users').doc(reporteeId).set({
					displayName: '신고당한 사용자',
				});

				// db.collection을 Mock하여 쿼리 실패 시뮬레이션
				const originalCollection = db.collection;
				const mockCollection = jest.fn().mockImplementation((path) => {
					if (path === 'Reports') {
						// Reports 컬렉션 쿼리 시 에러 발생
						return {
							where: jest.fn().mockReturnThis(),
							get: jest
								.fn()
								.mockRejectedValue(new Error('Firestore connection failed')),
						};
					}
					return originalCollection.call(db, path);
				});

				db.collection = mockCollection as any;

				const reportData = {
					reporteeId,
					createdAt: Timestamp.now(),
				};

				// 함수가 에러를 throw해야 함
				await expect(handleUserReport(reportData)).rejects.toThrow();

				// 에러가 로그되었는지 확인
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					'Reports 컬렉션 쿼리 실패:',
					expect.any(Error),
				);

				// Mock 복원
				db.collection = originalCollection;
				consoleErrorSpy.mockRestore();
			});
		});
	});

	/**
	 * 테스트 데이터 클린업 함수
	 */
	describe('restoreUserPostsAfterSuspension 함수', () => {
		const suspendedPostId = 'restore_suspended_post';
		const adminHiddenPostId = 'restore_admin_hidden_post';

		afterEach(async () => {
			await Promise.all([
				db.doc(`Boards/${suspendedPostId}`).delete(),
				db.doc(`Communities/${adminHiddenPostId}`).delete(),
			]);
		});

		it('정지로 숨긴 글은 복구하고, 관리자가 숨긴 글은 그대로 둔다', async () => {
			await db.doc(`Boards/${suspendedPostId}`).set({ creatorId: reporteeId, status: 'hidden' });
			await db
				.doc(`Communities/${adminHiddenPostId}`)
				.set({ creatorId: reporteeId, status: 'hidden', hiddenByAdmin: true });

			await restoreUserPostsAfterSuspension(reporteeId);

			const [suspendedPost, adminHiddenPost] = await Promise.all([
				db.doc(`Boards/${suspendedPostId}`).get(),
				db.doc(`Communities/${adminHiddenPostId}`).get(),
			]);
			expect(suspendedPost.data()?.status).toBe('active');
			expect(adminHiddenPost.data()?.status).toBe('hidden');
		});
	});

	describe('liftUserSuspension 함수', () => {
		const suspendedPostId = 'lift_suspended_post';

		afterEach(async () => {
			await db.doc(`Boards/${suspendedPostId}`).delete();
		});

		it('정지 기간이 남아 있어도 즉시 suspendUntil을 비우고 게시글을 복구한다', async () => {
			const tomorrow = Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000);
			await db
				.doc(`Users/${reporteeId}`)
				.set({ report: { total: 3, suspendUntil: tomorrow, needsAdminReview: true } });
			await db.doc(`Boards/${suspendedPostId}`).set({ creatorId: reporteeId, status: 'hidden' });

			await liftUserSuspension(reporteeId);

			const [user, post] = await Promise.all([
				db.doc(`Users/${reporteeId}`).get(),
				db.doc(`Boards/${suspendedPostId}`).get(),
			]);
			expect(user.data()?.report).toEqual({
				total: 3,
				suspendUntil: null,
				needsAdminReview: true,
			});
			expect(post.data()?.status).toBe('active');
		});
	});

	async function cleanupTestData() {
		const testUserIds = [reporteeId, 'non_existent_user'];

		// Users 컬렉션 정리
		const userDeletePromises = testUserIds.map((uid) =>
			db.collection('Users').doc(uid).delete(),
		);

		// Reports 컬렉션 정리
		const reportsSnap = await db.collection('Reports').get();
		const reportDeletePromises = reportsSnap.docs.map((doc) =>
			doc.ref.delete(),
		);

		await Promise.all([...userDeletePromises, ...reportDeletePromises]);
	}
});
