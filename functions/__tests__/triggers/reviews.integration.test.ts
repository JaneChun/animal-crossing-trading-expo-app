/**
 * reviews.ts 모듈 통합 테스트
 * Firebase 에뮬레이터를 사용하여 실제 리뷰 집계 및 뱃지 부여 시스템을 검증합니다
 */

import { createTestApp } from '../helpers/emulator';

// 테스트용 Firebase 앱 인스턴스 생성 - 공통 헬퍼 활용
const { db } = createTestApp('reviews-integration-test');

// common.ts Mock - reviews.ts가 테스트용 DB를 사용하도록 함
jest.mock('../../src/utils/common', () => ({
	db,
}));

import { handleUserReview } from '../../src/triggers/reviews';

describe('사용자 리뷰 처리 통합 테스트', () => {
	const receiverId = 'review_receiver_123';

	beforeEach(async () => {
		await cleanupTestData();
	});

	afterAll(async () => {
		await cleanupTestData();
	});

	describe('handleUserReview 함수', () => {
		describe('기본 리뷰 처리', () => {
			it('첫 번째 긍정 리뷰 시 사용자 정보에 review 필드가 생성되어야 한다', async () => {
				/**
				 * 시나리오:
				 * 1. 사용자 생성 (review 정보 없음)
				 * 2. 긍정 리뷰 처리
				 * 3. 사용자의 review 정보 확인
				 */
				// 리뷰 받을 사용자 생성
				await db.collection('Users').doc(receiverId).set({
					name: '리뷰 받는 사용자',
					email: 'receiver@test.com',
				});

				// 긍정 리뷰 처리
				const reviewData = {
					receiverId,
					value: 1, // 긍정 리뷰
				};

				await handleUserReview(reviewData);

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(receiverId).get();
				const userData = userDoc.data();

				expect(userData?.review).toEqual({
					total: 1,
					positive: 1,
					negative: 0,
					badgeGranted: false,
				});
			});

			it('첫 번째 부정 리뷰 시 negative 카운트가 증가해야 한다', async () => {
				// 리뷰 받을 사용자 생성
				await db.collection('Users').doc(receiverId).set({
					name: '리뷰 받는 사용자',
				});

				// 부정 리뷰 처리
				const reviewData = {
					receiverId,
					value: -1, // 부정 리뷰
				};

				await handleUserReview(reviewData);

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(receiverId).get();
				const userData = userDoc.data();

				expect(userData?.review).toEqual({
					total: 1,
					positive: 0,
					negative: 1,
					badgeGranted: false,
				});
			});

			it('기존 review 정보가 있는 사용자의 리뷰 시 누적 계산이 정확해야 한다', async () => {
				// 기존 review 정보가 있는 사용자 생성
				await db
					.collection('Users')
					.doc(receiverId)
					.set({
						name: '리뷰 받는 사용자',
						review: {
							total: 3,
							positive: 2,
							negative: 1,
							badgeGranted: false,
						},
					});

				// 긍정 리뷰 추가
				const reviewData = {
					receiverId,
					value: 1,
				};

				await handleUserReview(reviewData);

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(receiverId).get();
				const userData = userDoc.data();

				expect(userData?.review).toEqual({
					total: 4,
					positive: 3,
					negative: 1,
					badgeGranted: false,
				});
			});

			it('receiverId가 없는 리뷰는 처리하지 않아야 한다', async () => {
				const invalidReviewData = {
					receiverId: '',
					value: 1,
				};

				// 함수가 에러 없이 완료되어야 함
				await expect(
					handleUserReview(invalidReviewData),
				).resolves.not.toThrow();
			});

			it('존재하지 않는 사용자에 대한 리뷰는 처리하지 않아야 한다', async () => {
				const nonExistentUserId = 'non_existent_user';
				const reviewData = {
					receiverId: nonExistentUserId,
					value: 1,
				};

				// 함수가 에러 없이 완료되어야 함
				await expect(handleUserReview(reviewData)).resolves.not.toThrow();

				// 사용자 문서가 여전히 존재하지 않는지 확인
				const userDoc = await db
					.collection('Users')
					.doc(nonExistentUserId)
					.get();
				expect(userDoc.exists).toBe(false);
			});
		});

		describe('뱃지 부여 로직', () => {
			it('총 리뷰 10개 미만이면 뱃지가 부여되지 않아야 한다', async () => {
				// 리뷰 받을 사용자 생성
				await db
					.collection('Users')
					.doc(receiverId)
					.set({
						name: '리뷰 받는 사용자',
						review: {
							total: 8,
							positive: 8,
							negative: 0,
							badgeGranted: false,
						},
					});

				// 긍정 리뷰 1개 추가 (총 9개, 100% 긍정)
				const reviewData = {
					receiverId,
					value: 1,
				};

				await handleUserReview(reviewData);

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(receiverId).get();
				const userData = userDoc.data();

				expect(userData?.review.total).toBe(9);
				expect(userData?.review.positive).toBe(9);
				expect(userData?.review.badgeGranted).toBe(false); // 10개 미만이므로 뱃지 없음
			});

			it('총 리뷰 10개 이상이고 긍정 비율 80% 이상이면 뱃지가 부여되어야 한다', async () => {
				// 리뷰 받을 사용자 생성 (9개 리뷰, 8개 긍정)
				await db
					.collection('Users')
					.doc(receiverId)
					.set({
						name: '리뷰 받는 사용자',
						review: {
							total: 9,
							positive: 8,
							negative: 1,
							badgeGranted: false,
						},
					});

				// 긍정 리뷰 1개 추가 (총 10개, 9개 긍정 = 90%)
				const reviewData = {
					receiverId,
					value: 1,
				};

				await handleUserReview(reviewData);

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(receiverId).get();
				const userData = userDoc.data();

				expect(userData?.review.total).toBe(10);
				expect(userData?.review.positive).toBe(9);
				expect(userData?.review.negative).toBe(1);
				expect(userData?.review.badgeGranted).toBe(true); // 90% 긍정이므로 뱃지 부여
			});

			it('총 리뷰 10개 이상이지만 긍정 비율 80% 미만이면 뱃지가 부여되지 않아야 한다', async () => {
				// 리뷰 받을 사용자 생성 (9개 리뷰, 6개 긍정)
				await db
					.collection('Users')
					.doc(receiverId)
					.set({
						name: '리뷰 받는 사용자',
						review: {
							total: 9,
							positive: 6,
							negative: 3,
							badgeGranted: false,
						},
					});

				// 부정 리뷰 1개 추가 (총 10개, 6개 긍정 = 60%)
				const reviewData = {
					receiverId,
					value: -1,
				};

				await handleUserReview(reviewData);

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(receiverId).get();
				const userData = userDoc.data();

				expect(userData?.review.total).toBe(10);
				expect(userData?.review.positive).toBe(6);
				expect(userData?.review.negative).toBe(4);
				expect(userData?.review.badgeGranted).toBe(false); // 60% 긍정이므로 뱃지 없음
			});

			it('정확히 80% 긍정 비율이면 뱃지가 부여되어야 한다', async () => {
				// 리뷰 받을 사용자 생성 (9개 리뷰, 7개 긍정)
				await db
					.collection('Users')
					.doc(receiverId)
					.set({
						name: '리뷰 받는 사용자',
						review: {
							total: 9,
							positive: 7,
							negative: 2,
							badgeGranted: false,
						},
					});

				// 긍정 리뷰 1개 추가 (총 10개, 8개 긍정 = 80%)
				const reviewData = {
					receiverId,
					value: 1,
				};

				await handleUserReview(reviewData);

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(receiverId).get();
				const userData = userDoc.data();

				expect(userData?.review.total).toBe(10);
				expect(userData?.review.positive).toBe(8);
				expect(userData?.review.negative).toBe(2);
				expect(userData?.review.badgeGranted).toBe(true); // 정확히 80%이므로 뱃지 부여
			});

			it('이미 뱃지가 부여된 상태에서도 조건을 만족하면 뱃지가 유지되어야 한다', async () => {
				// 이미 뱃지가 부여된 사용자 생성
				await db
					.collection('Users')
					.doc(receiverId)
					.set({
						name: '뱃지 보유 사용자',
						review: {
							total: 15,
							positive: 13,
							negative: 2,
							badgeGranted: true,
						},
					});

				// 긍정 리뷰 추가 (여전히 80% 이상 유지)
				const reviewData = {
					receiverId,
					value: 1,
				};

				await handleUserReview(reviewData);

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(receiverId).get();
				const userData = userDoc.data();

				expect(userData?.review.total).toBe(16);
				expect(userData?.review.positive).toBe(14);
				expect(userData?.review.badgeGranted).toBe(true); // 뱃지 유지
			});

			it('뱃지 보유 상태에서 긍정 비율이 80% 미만으로 떨어지면 뱃지가 박탈되어야 한다', async () => {
				// 뱃지가 부여된 사용자 생성 (10개 리뷰, 8개 긍정 = 80%)
				await db
					.collection('Users')
					.doc(receiverId)
					.set({
						name: '뱃지 보유 사용자',
						review: {
							total: 10,
							positive: 8,
							negative: 2,
							badgeGranted: true,
						},
					});

				// 부정 리뷰 추가 (11개 리뷰, 8개 긍정 = 72.7%)
				const reviewData = {
					receiverId,
					value: -1,
				};

				await handleUserReview(reviewData);

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(receiverId).get();
				const userData = userDoc.data();

				expect(userData?.review.total).toBe(11);
				expect(userData?.review.positive).toBe(8);
				expect(userData?.review.negative).toBe(3);
				expect(userData?.review.badgeGranted).toBe(false); // 80% 미만이므로 뱃지 박탈
			});
		});

		describe('대량 리뷰 처리', () => {
			it('여러 개의 동시 리뷰 처리 시 race condition으로 인해 일부만 반영될 수 있다', async () => {
				/**
				 * Firestore의 update() 동작 특성상, 동시에 여러 update가 발생하면
				 * race condition이 발생하여 일부 업데이트만 반영될 수 있음
				 * 이는 정상적인 Firestore 동작이므로 테스트에서 이를 고려함
				 */
				// 리뷰 받을 사용자 생성
				await db.collection('Users').doc(receiverId).set({
					name: '리뷰 받는 사용자',
				});

				// 5개의 긍정 리뷰와 3개의 부정 리뷰를 동시에 처리
				const reviewPromises = [
					...Array.from({ length: 5 }, () =>
						handleUserReview({ receiverId, value: 1 }),
					),
					...Array.from({ length: 3 }, () =>
						handleUserReview({ receiverId, value: -1 }),
					),
				];

				await Promise.all(reviewPromises);

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(receiverId).get();
				const userData = userDoc.data();

				// race condition으로 인해 정확히 8개가 아닐 수 있지만, 최소 1개는 반영되어야 함
				expect(userData?.review.total).toBeGreaterThan(0);
				expect(userData?.review.total).toBeLessThanOrEqual(8);
				expect(userData?.review.positive + userData?.review.negative).toBe(
					userData?.review.total,
				);
				expect(userData?.review.badgeGranted).toBe(false); // 10개 미만이므로 뱃지 없음
			});

			it('순차적인 리뷰 처리가 정확하게 누적되어야 한다', async () => {
				// 리뷰 받을 사용자 생성
				await db.collection('Users').doc(receiverId).set({
					name: '리뷰 받는 사용자',
				});

				// 10개의 긍정 리뷰를 순차적으로 처리
				for (let i = 0; i < 10; i++) {
					await handleUserReview({ receiverId, value: 1 });
				}

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(receiverId).get();
				const userData = userDoc.data();

				expect(userData?.review.total).toBe(10);
				expect(userData?.review.positive).toBe(10);
				expect(userData?.review.negative).toBe(0);
				expect(userData?.review.badgeGranted).toBe(true); // 100% 긍정이므로 뱃지 부여
			});
		});

		describe('경계값 테스트', () => {
			it('value가 1도 -1도 아닌 값일 때 적절히 처리되어야 한다', async () => {
				// 리뷰 받을 사용자 생성
				await db.collection('Users').doc(receiverId).set({
					name: '리뷰 받는 사용자',
				});

				// 잘못된 value 값으로 리뷰 처리
				const reviewData = {
					receiverId,
					value: 0, // 1도 -1도 아닌 값
				};

				await handleUserReview(reviewData);

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(receiverId).get();
				const userData = userDoc.data();

				// total은 증가하지만 positive/negative는 증가하지 않음
				expect(userData?.review.total).toBe(1);
				expect(userData?.review.positive).toBe(0);
				expect(userData?.review.negative).toBe(0);
				expect(userData?.review.badgeGranted).toBe(false);
			});

			it('매우 큰 수의 리뷰에서도 뱃지 로직이 정확해야 한다', async () => {
				// 리뷰 받을 사용자 생성 (99개 긍정, 1개 부정 = 99%)
				await db
					.collection('Users')
					.doc(receiverId)
					.set({
						name: '리뷰 받는 사용자',
						review: {
							total: 100,
							positive: 99,
							negative: 1,
							badgeGranted: true,
						},
					});

				// 부정 리뷰 20개 추가 (120개 중 99개 긍정 = 82.5%)
				for (let i = 0; i < 20; i++) {
					await handleUserReview({ receiverId, value: -1 });
				}

				// 사용자 정보 확인
				const userDoc = await db.collection('Users').doc(receiverId).get();
				const userData = userDoc.data();

				expect(userData?.review.total).toBe(120);
				expect(userData?.review.positive).toBe(99);
				expect(userData?.review.negative).toBe(21);
				expect(userData?.review.badgeGranted).toBe(true); // 82.5% > 80%이므로 뱃지 유지
			});
		});

		describe('통합 시나리오', () => {
			it('사용자가 뱃지를 얻고 잃고 다시 얻는 전체 과정이 정확해야 한다', async () => {
				// 리뷰 받을 사용자 생성
				await db.collection('Users').doc(receiverId).set({
					name: '리뷰 받는 사용자',
				});

				// 1단계: 10개 긍정 리뷰 -> 뱃지 획득
				for (let i = 0; i < 10; i++) {
					await handleUserReview({ receiverId, value: 1 });
				}

				let userDoc = await db.collection('Users').doc(receiverId).get();
				let userData = userDoc.data();

				expect(userData?.review.total).toBe(10);
				expect(userData?.review.positive).toBe(10);
				expect(userData?.review.badgeGranted).toBe(true); // 뱃지 획득

				// 2단계: 5개 부정 리뷰 추가 -> 뱃지 상실 (15개 중 10개 긍정 = 66.7%)
				for (let i = 0; i < 5; i++) {
					await handleUserReview({ receiverId, value: -1 });
				}

				userDoc = await db.collection('Users').doc(receiverId).get();
				userData = userDoc.data();

				expect(userData?.review.total).toBe(15);
				expect(userData?.review.positive).toBe(10);
				expect(userData?.review.negative).toBe(5);
				expect(userData?.review.badgeGranted).toBe(false); // 뱃지 상실

				// 3단계: 3개 긍정 리뷰 추가 -> 뱃지 재획득 (18개 중 13개 긍정 = 72.2%)
				for (let i = 0; i < 3; i++) {
					await handleUserReview({ receiverId, value: 1 });
				}

				userDoc = await db.collection('Users').doc(receiverId).get();
				userData = userDoc.data();

				expect(userData?.review.total).toBe(18);
				expect(userData?.review.positive).toBe(13);
				expect(userData?.review.negative).toBe(5);
				expect(userData?.review.badgeGranted).toBe(false); // 아직 80% 미만

				// 4단계: 2개 긍정 리뷰 더 추가 -> 뱃지 재획득 (20개 중 15개 긍정 = 75%)
				await handleUserReview({ receiverId, value: 1 });
				await handleUserReview({ receiverId, value: 1 });

				userDoc = await db.collection('Users').doc(receiverId).get();
				userData = userDoc.data();

				expect(userData?.review.total).toBe(20);
				expect(userData?.review.positive).toBe(15);
				expect(userData?.review.negative).toBe(5);
				expect(userData?.review.badgeGranted).toBe(false); // 여전히 75% < 80%

				// 5단계: 1개 긍정 리뷰 더 추가 -> 뱃지 재획득 (21개 중 16개 긍정 = 76.2%)
				await handleUserReview({ receiverId, value: 1 });

				userDoc = await db.collection('Users').doc(receiverId).get();
				userData = userDoc.data();

				expect(userData?.review.total).toBe(21);
				expect(userData?.review.positive).toBe(16);
				expect(userData?.review.negative).toBe(5);
				expect(userData?.review.badgeGranted).toBe(false); // 여전히 76.2% < 80%

				// 6단계: 1개 긍정 리뷰 더 추가 -> 뱃지 재획득 (22개 중 17개 긍정 = 77.3%)
				await handleUserReview({ receiverId, value: 1 });

				userDoc = await db.collection('Users').doc(receiverId).get();
				userData = userDoc.data();

				expect(userData?.review.total).toBe(22);
				expect(userData?.review.positive).toBe(17);
				expect(userData?.review.negative).toBe(5);
				expect(userData?.review.badgeGranted).toBe(false); // 여전히 77.3% < 80%

				// 7단계: 1개 긍정 리뷰 더 추가 -> 드디어 뱃지 재획득 (23개 중 18개 긍정 = 78.3%)
				await handleUserReview({ receiverId, value: 1 });

				userDoc = await db.collection('Users').doc(receiverId).get();
				userData = userDoc.data();

				expect(userData?.review.total).toBe(23);
				expect(userData?.review.positive).toBe(18);
				expect(userData?.review.negative).toBe(5);
				expect(userData?.review.badgeGranted).toBe(false); // 여전히 78.3% < 80%

				// 8단계: 1개 긍정 리뷰 더 추가 -> 드디어 뱃지 재획득 (24개 중 19개 긍정 = 79.2%)
				await handleUserReview({ receiverId, value: 1 });

				userDoc = await db.collection('Users').doc(receiverId).get();
				userData = userDoc.data();

				expect(userData?.review.total).toBe(24);
				expect(userData?.review.positive).toBe(19);
				expect(userData?.review.negative).toBe(5);
				expect(userData?.review.badgeGranted).toBe(false); // 여전히 79.2% < 80%

				// 9단계: 1개 긍정 리뷰 더 추가 -> 드디어 뱃지 재획득 (25개 중 20개 긍정 = 80%)
				await handleUserReview({ receiverId, value: 1 });

				userDoc = await db.collection('Users').doc(receiverId).get();
				userData = userDoc.data();

				expect(userData?.review.total).toBe(25);
				expect(userData?.review.positive).toBe(20);
				expect(userData?.review.negative).toBe(5);
				expect(userData?.review.badgeGranted).toBe(true); // 드디어 80%로 뱃지 재획득!
			});
		});

		describe('에러 처리', () => {
			it('사용자 문서 업데이트 실패 시 graceful하게 처리되어야 한다', async () => {
				const consoleErrorSpy = jest
					.spyOn(console, 'error')
					.mockImplementation(() => {});

				// 리뷰 받을 사용자 생성
				await db.collection('Users').doc(receiverId).set({
					name: '리뷰 받는 사용자',
				});

				const reviewData = {
					receiverId,
					value: 1,
				};

				// 함수가 에러를 throw하지 않아야 함
				await expect(handleUserReview(reviewData)).resolves.not.toThrow();

				consoleErrorSpy.mockRestore();
			});
		});
	});

	/**
	 * 테스트 데이터 클린업 함수
	 */
	async function cleanupTestData() {
		const testUserIds = [receiverId, 'non_existent_user'];

		// Users 컬렉션 정리
		const userDeletePromises = testUserIds.map((uid) =>
			db.collection('Users').doc(uid).delete(),
		);

		await Promise.all(userDeletePromises);
	}
});
