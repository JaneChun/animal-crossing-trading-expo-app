/**
 * comments.ts 모듈 통합 테스트
 * Firebase 에뮬레이터를 사용하여 실제 FieldValue.increment() 동작을 검증합니다
 */

// 에뮬레이터 연결 설정
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// 테스트용 Firebase 앱 인스턴스 생성
const testApp = initializeApp(
	{
		projectId: 'animal-crossing-trade-expo-app',
	},
	'comments-integration-test',
);

const db = getFirestore(testApp);

// common.ts Mock - comments.ts가 테스트용 DB를 사용하도록 함
jest.mock('../../src/utils/common', () => ({
	db,
}));

import {
	handleCommentCreated,
	handleCommentDeleted,
} from '../../src/triggers/comments';

describe('댓글 카운터 처리 통합 테스트', () => {
	const boardsCollection = 'Boards';
	const communitiesCollection = 'Communities';
	const postId = 'test_post_123';

	beforeEach(async () => {
		await cleanupTestData();
	});

	afterAll(async () => {
		await cleanupTestData();
	});

	describe('handleCommentCreated 함수', () => {
		describe('성공 케이스', () => {
			it('댓글 생성 시 게시글의 commentCount가 1 증가해야 한다', async () => {
				/**
				 * 시나리오:
				 * 1. 초기 게시글 생성 (commentCount: 0)
				 * 2. handleCommentCreated 호출
				 * 3. commentCount가 1로 증가했는지 확인
				 */
				// 초기 게시글 생성
				await db.collection(boardsCollection).doc(postId).set({
					title: '테스트 게시글',
					commentCount: 0,
				});

				// 댓글 생성 처리
				await handleCommentCreated(boardsCollection, postId);

				// commentCount 증가 확인
				const postDoc = await db.collection(boardsCollection).doc(postId).get();
				const postData = postDoc.data();

				expect(postData?.commentCount).toBe(1);
			});

			it('commentCount가 없는 게시글에서도 정상적으로 1로 설정되어야 한다', async () => {
				/**
				 * FieldValue.increment(1)는 필드가 없으면 1로 설정,
				 * 있으면 기존 값에 1을 더함
				 */
				// commentCount 없는 게시글 생성
				await db.collection(boardsCollection).doc(postId).set({
					title: '테스트 게시글',
				});

				// 댓글 생성 처리
				await handleCommentCreated(boardsCollection, postId);

				// commentCount가 1로 설정되었는지 확인
				const postDoc = await db.collection(boardsCollection).doc(postId).get();
				const postData = postDoc.data();

				expect(postData?.commentCount).toBe(1);
			});

			it('기존 commentCount가 있는 경우 정확히 1씩 증가해야 한다', async () => {
				// 초기 commentCount가 5인 게시글 생성
				await db.collection(boardsCollection).doc(postId).set({
					title: '테스트 게시글',
					commentCount: 5,
				});

				// 댓글 생성 처리
				await handleCommentCreated(boardsCollection, postId);

				// commentCount가 6으로 증가했는지 확인
				const postDoc = await db.collection(boardsCollection).doc(postId).get();
				const postData = postDoc.data();

				expect(postData?.commentCount).toBe(6);
			});

			it('Communities 컬렉션에서도 정상적으로 동작해야 한다', async () => {
				const communityPostId = 'community_post_456';

				// 커뮤니티 게시글 생성
				await db.collection(communitiesCollection).doc(communityPostId).set({
					title: '커뮤니티 게시글',
					commentCount: 3,
				});

				// 댓글 생성 처리
				await handleCommentCreated(communitiesCollection, communityPostId);

				// commentCount 증가 확인
				const postDoc = await db
					.collection(communitiesCollection)
					.doc(communityPostId)
					.get();
				const postData = postDoc.data();

				expect(postData?.commentCount).toBe(4);
			});

			it('여러 댓글이 동시에 생성되어도 정확한 카운트가 유지되어야 한다', async () => {
				// 초기 게시글 생성
				await db.collection(boardsCollection).doc(postId).set({
					title: '테스트 게시글',
					commentCount: 0,
				});

				// 5개의 댓글을 동시에 생성
				const commentPromises = Array.from({ length: 5 }, () =>
					handleCommentCreated(boardsCollection, postId),
				);

				await Promise.all(commentPromises);

				// commentCount가 5로 증가했는지 확인
				const postDoc = await db.collection(boardsCollection).doc(postId).get();
				const postData = postDoc.data();

				expect(postData?.commentCount).toBe(5);
			});

			it('서로 다른 게시글의 댓글 카운트는 독립적이어야 한다', async () => {
				const post1 = 'post_1';
				const post2 = 'post_2';

				// 두 개의 게시글 생성
				await Promise.all([
					db.collection(boardsCollection).doc(post1).set({
						title: '게시글 1',
						commentCount: 2,
					}),
					db.collection(boardsCollection).doc(post2).set({
						title: '게시글 2',
						commentCount: 7,
					}),
				]);

				// 각각에 댓글 생성
				await Promise.all([
					handleCommentCreated(boardsCollection, post1),
					handleCommentCreated(boardsCollection, post2),
				]);

				// 각 게시글의 commentCount 독립적 증가 확인
				const [post1Doc, post2Doc] = await Promise.all([
					db.collection(boardsCollection).doc(post1).get(),
					db.collection(boardsCollection).doc(post2).get(),
				]);

				expect(post1Doc.data()?.commentCount).toBe(3);
				expect(post2Doc.data()?.commentCount).toBe(8);
			});
		});

		describe('에러 시나리오', () => {
			it('존재하지 않는 게시글에 댓글 생성 시도 시 에러를 로그하고 문서는 생성되지 않아야 한다', async () => {
				/**
				 * Firestore의 update()는 존재하지 않는 문서에 대해 NOT_FOUND 에러를 발생시킴
				 * 하지만 에러는 catch되어 로그만 남기고 처리가 완료됨
				 */
				const consoleErrorSpy = jest
					.spyOn(console, 'error')
					.mockImplementation(() => {});

				const nonExistentPostId = 'non_existent_post';

				// 존재하지 않는 게시글에 댓글 생성 시도
				await expect(
					handleCommentCreated(boardsCollection, nonExistentPostId),
				).resolves.not.toThrow();

				// 에러가 로그되었는지 확인
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					`댓글 수 증가 실패 ${boardsCollection}/${nonExistentPostId}`,
					expect.any(Error),
				);

				// 문서가 생성되지 않았는지 확인
				const postDoc = await db
					.collection(boardsCollection)
					.doc(nonExistentPostId)
					.get();
				expect(postDoc.exists).toBe(false);

				consoleErrorSpy.mockRestore();
			});
		});
	});

	describe('handleCommentDeleted 함수', () => {
		describe('성공 케이스', () => {
			it('댓글 삭제 시 게시글의 commentCount가 1 감소해야 한다', async () => {
				// 초기 게시글 생성 (commentCount: 5)
				await db.collection(boardsCollection).doc(postId).set({
					title: '테스트 게시글',
					commentCount: 5,
				});

				// 댓글 삭제 처리
				await handleCommentDeleted(boardsCollection, postId);

				// commentCount 감소 확인
				const postDoc = await db.collection(boardsCollection).doc(postId).get();
				const postData = postDoc.data();

				expect(postData?.commentCount).toBe(4);
			});

			it('commentCount가 0인 상태에서 삭제하면 음수가 되어야 한다', async () => {
				/**
				 * FieldValue.increment(-1)는 0에서도 -1로 만듦
				 * 비즈니스 로직에서 음수 방지 처리가 필요하지만
				 * 트리거 레벨에서는 단순히 요청을 처리
				 */
				// 초기 게시글 생성 (commentCount: 0)
				await db.collection(boardsCollection).doc(postId).set({
					title: '테스트 게시글',
					commentCount: 0,
				});

				// 댓글 삭제 처리
				await handleCommentDeleted(boardsCollection, postId);

				// commentCount가 -1이 되었는지 확인
				const postDoc = await db.collection(boardsCollection).doc(postId).get();
				const postData = postDoc.data();

				expect(postData?.commentCount).toBe(-1);
			});

			it('commentCount가 없는 게시글에서 삭제하면 -1로 설정되어야 한다', async () => {
				// commentCount 없는 게시글 생성
				await db.collection(boardsCollection).doc(postId).set({
					title: '테스트 게시글',
				});

				// 댓글 삭제 처리
				await handleCommentDeleted(boardsCollection, postId);

				// commentCount가 -1로 설정되었는지 확인
				const postDoc = await db.collection(boardsCollection).doc(postId).get();
				const postData = postDoc.data();

				expect(postData?.commentCount).toBe(-1);
			});

			it('여러 댓글이 동시에 삭제되어도 정확한 카운트가 유지되어야 한다', async () => {
				// 초기 게시글 생성 (commentCount: 10)
				await db.collection(boardsCollection).doc(postId).set({
					title: '테스트 게시글',
					commentCount: 10,
				});

				// 3개의 댓글을 동시에 삭제
				const deletePromises = Array.from({ length: 3 }, () =>
					handleCommentDeleted(boardsCollection, postId),
				);

				await Promise.all(deletePromises);

				// commentCount가 7로 감소했는지 확인
				const postDoc = await db.collection(boardsCollection).doc(postId).get();
				const postData = postDoc.data();

				expect(postData?.commentCount).toBe(7);
			});
		});

		describe('에러 시나리오', () => {
			it('존재하지 않는 게시글의 댓글 삭제 시도 시 에러를 로그하고 문서는 생성되지 않아야 한다', async () => {
				const consoleErrorSpy = jest
					.spyOn(console, 'error')
					.mockImplementation(() => {});

				const nonExistentPostId = 'non_existent_post_delete';

				// 존재하지 않는 게시글의 댓글 삭제 시도
				await expect(
					handleCommentDeleted(boardsCollection, nonExistentPostId),
				).resolves.not.toThrow();

				// 에러가 로그되었는지 확인
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					`댓글 수 감소 실패 ${boardsCollection}/${nonExistentPostId}`,
					expect.any(Error),
				);

				// 문서가 생성되지 않았는지 확인
				const postDoc = await db
					.collection(boardsCollection)
					.doc(nonExistentPostId)
					.get();
				expect(postDoc.exists).toBe(false);

				consoleErrorSpy.mockRestore();
			});
		});
	});

	describe('통합 시나리오', () => {
		it('댓글 생성과 삭제가 순차적으로 정상 처리되어야 한다', async () => {
			// 초기 게시글 생성 (commentCount: 5)
			await db.collection(boardsCollection).doc(postId).set({
				title: '테스트 게시글',
				commentCount: 5,
			});

			// 댓글 생성 -> 6
			await handleCommentCreated(boardsCollection, postId);

			let postDoc = await db.collection(boardsCollection).doc(postId).get();
			expect(postDoc.data()?.commentCount).toBe(6);

			// 댓글 삭제 -> 5
			await handleCommentDeleted(boardsCollection, postId);

			postDoc = await db.collection(boardsCollection).doc(postId).get();
			expect(postDoc.data()?.commentCount).toBe(5);

			// 추가 댓글 생성 -> 6
			await handleCommentCreated(boardsCollection, postId);

			postDoc = await db.collection(boardsCollection).doc(postId).get();
			expect(postDoc.data()?.commentCount).toBe(6);
		});

		it('동시 생성과 삭제가 정확하게 계산되어야 한다', async () => {
			// 초기 게시글 생성 (commentCount: 10)
			await db.collection(boardsCollection).doc(postId).set({
				title: '테스트 게시글',
				commentCount: 10,
			});

			// 3개 생성, 2개 삭제를 동시에 처리
			await Promise.all([
				handleCommentCreated(boardsCollection, postId),
				handleCommentCreated(boardsCollection, postId),
				handleCommentCreated(boardsCollection, postId),
				handleCommentDeleted(boardsCollection, postId),
				handleCommentDeleted(boardsCollection, postId),
			]);

			// 최종 commentCount는 11이어야 함 (10 + 3 - 2 = 11)
			const postDoc = await db.collection(boardsCollection).doc(postId).get();
			expect(postDoc.data()?.commentCount).toBe(11);
		});

		it('서로 다른 컬렉션의 동일한 postId는 독립적으로 처리되어야 한다', async () => {
			const samePostId = 'same_post_id';

			// 같은 ID로 두 컬렉션에 게시글 생성
			await Promise.all([
				db.collection(boardsCollection).doc(samePostId).set({
					title: 'Boards 게시글',
					commentCount: 3,
				}),
				db.collection(communitiesCollection).doc(samePostId).set({
					title: 'Communities 게시글',
					commentCount: 7,
				}),
			]);

			// 각 컬렉션에서 댓글 생성/삭제
			await Promise.all([
				handleCommentCreated(boardsCollection, samePostId),
				handleCommentDeleted(communitiesCollection, samePostId),
			]);

			// 각 컬렉션의 commentCount 독립적 변경 확인
			const [boardsDoc, communitiesDoc] = await Promise.all([
				db.collection(boardsCollection).doc(samePostId).get(),
				db.collection(communitiesCollection).doc(samePostId).get(),
			]);

			expect(boardsDoc.data()?.commentCount).toBe(4); // 3 + 1
			expect(communitiesDoc.data()?.commentCount).toBe(6); // 7 - 1
		});

		it('대량의 동시 요청에서도 정확한 카운트가 유지되어야 한다', async () => {
			// 초기 게시글 생성 (commentCount: 100)
			await db.collection(boardsCollection).doc(postId).set({
				title: '테스트 게시글',
				commentCount: 100,
			});

			// 50개 생성, 30개 삭제를 동시에 처리
			const operations = [
				...Array.from({ length: 50 }, () =>
					handleCommentCreated(boardsCollection, postId),
				),
				...Array.from({ length: 30 }, () =>
					handleCommentDeleted(boardsCollection, postId),
				),
			];

			await Promise.all(operations);

			// 최종 commentCount는 120이어야 함 (100 + 50 - 30 = 120)
			const postDoc = await db.collection(boardsCollection).doc(postId).get();
			expect(postDoc.data()?.commentCount).toBe(120);
		}, 30000); // 30초 타임아웃
	});

	/**
	 * 테스트 데이터 클린업 함수
	 */
	async function cleanupTestData() {
		const testPostIds = [
			postId,
			'community_post_456',
			'post_1',
			'post_2',
			'non_existent_post',
			'non_existent_post_delete',
			'same_post_id',
		];

		const deletePromises = testPostIds.flatMap((id) => [
			db.collection(boardsCollection).doc(id).delete(),
			db.collection(communitiesCollection).doc(id).delete(),
		]);

		await Promise.all(deletePromises);
	}
});
