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

import { handleUserReport } from '../../src/triggers/reports';

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
					suspendUntil: null,
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

		describe('7일 정지 로직', () => {
			it('최근 7일 신고가 3건 이상이면 7일 정지되어야 한다', async () => {
				/**
				 * 시나리오:
				 * 1. 사용자 생성
				 * 2. 최근 7일 내 신고 3건 생성
				 * 3. 신고 처리 시 7일 정지 적용 확인
				 */
				// 신고당할 사용자 생성
				await db.collection('Users').doc(reporteeId).set({
					displayName: '신고당한 사용자',
				});

				const now = Timestamp.now();
				const recentTimestamp = Timestamp.fromDate(
					new Date(now.toMillis() - 2 * 24 * 60 * 60 * 1000),
				); // 2일 전

				// 최근 7일 내 신고 2건 생성
				await Promise.all([
					db.collection('Reports').add({
						reporteeId,
						reporterId: 'reporter_1',
						createdAt: recentTimestamp,
					}),
					db.collection('Reports').add({
						reporteeId,
						reporterId: 'reporter_2',
						createdAt: recentTimestamp,
					}),
				]);

				// 3번째 신고 처리 (7일 정지 트리거)
				const reportData = {
					reporteeId,
					createdAt: now,
				};

				await db.collection('Reports').add({
					...reportData,
					reporterId: 'reporter_3',
				});

				await handleUserReport(reportData);

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(reporteeId).get();
				const userData = userDoc.data();

				// 7일 정지 확인
				const suspendUntil = userData?.report.suspendUntil;
				expect(suspendUntil).not.toBeNull();

				const suspendDuration = suspendUntil.toMillis() - now.toMillis();
				const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;
				const oneDayInMillis = 24 * 60 * 60 * 1000;

				// 7일 정지인지 확인 (setHours(0,0,0,0)으로 자정 기준 설정되므로 최대 24시간 차이 가능)
				expect(suspendDuration).toBeGreaterThan(sevenDaysInMillis - oneDayInMillis);
				expect(suspendDuration).toBeLessThanOrEqual(sevenDaysInMillis);

				expect(userData?.report.recent30Days).toBe(3);
				expect(userData?.report.needsAdminReview).toBeUndefined();
			});

			it('기존 정지 기간이 더 길면 연장되지 않아야 한다', async () => {
				const now = Timestamp.now();
				const existingSuspendUntil = Timestamp.fromDate(
					new Date(now.toMillis() + 10 * 24 * 60 * 60 * 1000),
				); // 10일 후

				// 기존에 정지된 사용자 생성
				await db
					.collection('Users')
					.doc(reporteeId)
					.set({
						displayName: '정지된 사용자',
						report: {
							total: 5,
							suspendUntil: existingSuspendUntil,
						},
					});

				// 최근 7일 내 신고 2건 생성
				const recentTimestamp = Timestamp.fromDate(
					new Date(now.toMillis() - 1 * 24 * 60 * 60 * 1000),
				);
				await Promise.all([
					db.collection('Reports').add({
						reporteeId,
						reporterId: 'reporter_1',
						createdAt: recentTimestamp,
					}),
					db.collection('Reports').add({
						reporteeId,
						reporterId: 'reporter_2',
						createdAt: recentTimestamp,
					}),
				]);

				// 3번째 신고 처리
				const reportData = {
					reporteeId,
					createdAt: now,
				};

				await db.collection('Reports').add({
					...reportData,
					reporterId: 'reporter_3',
				});

				await handleUserReport(reportData);

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(reporteeId).get();
				const userData = userDoc.data();

				// 기존 정지 기간이 유지되어야 함
				expect(userData?.report.suspendUntil.toMillis()).toBe(
					existingSuspendUntil.toMillis(),
				);
			});
		});

		describe('30일 정지 및 관리자 검토 로직', () => {
			it('최근 30일 신고가 7건 이상이면 30일 정지 + 관리자 검토 플래그가 설정되어야 한다', async () => {
				/**
				 * 시나리오:
				 * 1. 사용자 생성
				 * 2. 최근 30일 내 신고 7건 생성
				 * 3. 신고 처리 시 30일 정지 + needsAdminReview 플래그 확인
				 */
				// 신고당할 사용자 생성
				await db.collection('Users').doc(reporteeId).set({
					displayName: '신고당한 사용자',
				});

				const now = Timestamp.now();
				const recentTimestamp = Timestamp.fromDate(
					new Date(now.toMillis() - 15 * 24 * 60 * 60 * 1000),
				); // 15일 전

				// 최근 30일 내 신고 6건 생성
				const reportPromises = Array.from({ length: 6 }, (_, i) =>
					db.collection('Reports').add({
						reporteeId,
						reporterId: `reporter_${i}`,
						createdAt: recentTimestamp,
					}),
				);

				await Promise.all(reportPromises);

				// 7번째 신고 처리 (30일 정지 트리거)
				const reportData = {
					reporteeId,
					createdAt: now,
				};

				await db.collection('Reports').add({
					...reportData,
					reporterId: 'reporter_final',
				});

				await handleUserReport(reportData);

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(reporteeId).get();
				const userData = userDoc.data();

				// 30일 정지 확인
				const suspendUntil = userData?.report.suspendUntil;
				expect(suspendUntil).not.toBeNull();

				const suspendDuration = suspendUntil.toMillis() - now.toMillis();
				const thirtyDaysInMillis = 30 * 24 * 60 * 60 * 1000;
				const oneDayInMillis = 24 * 60 * 60 * 1000;

				// 30일 정지인지 확인 (setHours(0,0,0,0)으로 자정 기준 설정되므로 최대 24시간 차이 가능)
				expect(suspendDuration).toBeGreaterThan(thirtyDaysInMillis - oneDayInMillis);
				expect(suspendDuration).toBeLessThanOrEqual(thirtyDaysInMillis);

				// 관리자 검토 플래그 확인
				expect(userData?.report.needsAdminReview).toBe(true);
				expect(userData?.report.recent30Days).toBe(7);
			});

			it('7일 정지와 30일 정지 조건을 동시에 만족하면 30일 정지가 적용되어야 한다', async () => {
				// 신고당할 사용자 생성
				await db.collection('Users').doc(reporteeId).set({
					displayName: '신고당한 사용자',
				});

				const now = Timestamp.now();
				const recent7DaysTimestamp = Timestamp.fromDate(
					new Date(now.toMillis() - 3 * 24 * 60 * 60 * 1000),
				); // 3일 전
				const recent30DaysTimestamp = Timestamp.fromDate(
					new Date(now.toMillis() - 20 * 24 * 60 * 60 * 1000),
				); // 20일 전

				// 최근 7일 내 3건, 최근 30일 내 추가 4건 (총 7건) 생성
				await Promise.all([
					// 최근 7일 내 2건
					db.collection('Reports').add({
						reporteeId,
						reporterId: 'recent_1',
						createdAt: recent7DaysTimestamp,
					}),
					db.collection('Reports').add({
						reporteeId,
						reporterId: 'recent_2',
						createdAt: recent7DaysTimestamp,
					}),
					// 최근 30일 내 추가 4건
					...Array.from({ length: 4 }, (_, i) =>
						db.collection('Reports').add({
							reporteeId,
							reporterId: `old_${i}`,
							createdAt: recent30DaysTimestamp,
						}),
					),
				]);

				// 마지막 신고 (7일 조건 3번째, 30일 조건 7번째)
				const reportData = {
					reporteeId,
					createdAt: now,
				};

				await db.collection('Reports').add({
					...reportData,
					reporterId: 'final_reporter',
				});

				await handleUserReport(reportData);

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(reporteeId).get();
				const userData = userDoc.data();

				// 30일 정지가 적용되어야 함
				const suspendUntil = userData?.report.suspendUntil;
				const suspendDuration = suspendUntil.toMillis() - now.toMillis();
				const thirtyDaysInMillis = 30 * 24 * 60 * 60 * 1000;
				const oneDayInMillis = 24 * 60 * 60 * 1000;

				// 30일 정지인지 확인 (setHours(0,0,0,0)으로 자정 기준 설정되므로 최대 24시간 차이 가능)
				expect(suspendDuration).toBeGreaterThan(thirtyDaysInMillis - oneDayInMillis);
				expect(suspendDuration).toBeLessThanOrEqual(thirtyDaysInMillis);

				// 관리자 검토 플래그도 설정되어야 함
				expect(userData?.report.needsAdminReview).toBe(true);
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
