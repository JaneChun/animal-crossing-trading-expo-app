/**
 * replies.ts 모듈 통합 테스트
 * Firebase 에뮬레이터를 사용하여 답글 생성/삭제 시 댓글 수 증감을 검증합니다
 */

import { createTestApp } from '../helpers/emulator';

// 테스트용 Firebase 앱 인스턴스 생성 - 공통 헬퍼 활용
const { db } = createTestApp('replies-integration-test');

// common.ts Mock - replies.ts가 테스트용 DB를 사용하도록 함
jest.mock('../../src/utils/common', () => ({
	db,
}));

import {
	handleReplyCreated,
	handleReplyDeleted,
} from '../../src/triggers/replies';

describe('답글 생성/삭제 처리 통합 테스트', () => {
	const boardsPostId = 'test_board_post_123';
	const communitiesPostId = 'test_community_post_456';

	beforeEach(async () => {
		await cleanupTestData();
	});

	afterAll(async () => {
		await cleanupTestData();
	});

	describe('handleReplyCreated 함수', () => {
		describe('Boards 컬렉션', () => {
			it('답글 생성 시 게시글의 commentCount가 1 증가해야 한다', async () => {
				/**
				 * 시나리오:
				 * 1. Boards 컬렉션에 게시글 생성 (commentCount: 0)
				 * 2. handleReplyCreated 호출
				 * 3. commentCount가 1로 증가했는지 확인
				 */
				await db.collection('Boards').doc(boardsPostId).set({
					title: '테스트 게시글',
					body: '게시글 내용입니다.',
					commentCount: 0,
				});

				await handleReplyCreated('Boards', boardsPostId);

				const postDoc = await db.collection('Boards').doc(boardsPostId).get();
				const postData = postDoc.data();

				expect(postData?.commentCount).toBe(1);
			});

			it('기존 commentCount가 있는 게시글에서 답글 생성 시 정확히 1 증가해야 한다', async () => {
				await db.collection('Boards').doc(boardsPostId).set({
					title: '테스트 게시글',
					body: '게시글 내용입니다.',
					commentCount: 5,
				});

				await handleReplyCreated('Boards', boardsPostId);

				const postDoc = await db.collection('Boards').doc(boardsPostId).get();
				const postData = postDoc.data();

				expect(postData?.commentCount).toBe(6);
			});

			it('여러 개의 답글이 연속으로 생성되면 commentCount가 정확히 누적되어야 한다', async () => {
				await db.collection('Boards').doc(boardsPostId).set({
					title: '테스트 게시글',
					body: '게시글 내용입니다.',
					commentCount: 0,
				});

				// 3개의 답글 순차 생성
				await handleReplyCreated('Boards', boardsPostId);
				await handleReplyCreated('Boards', boardsPostId);
				await handleReplyCreated('Boards', boardsPostId);

				const postDoc = await db.collection('Boards').doc(boardsPostId).get();
				const postData = postDoc.data();

				expect(postData?.commentCount).toBe(3);
			});
		});

		describe('Communities 컬렉션', () => {
			it('Communities 게시글에서 답글 생성 시 commentCount가 1 증가해야 한다', async () => {
				await db.collection('Communities').doc(communitiesPostId).set({
					title: '커뮤니티 게시글',
					body: '커뮤니티 게시글 내용입니다.',
					commentCount: 0,
				});

				await handleReplyCreated('Communities', communitiesPostId);

				const postDoc = await db
					.collection('Communities')
					.doc(communitiesPostId)
					.get();
				const postData = postDoc.data();

				expect(postData?.commentCount).toBe(1);
			});
		});

		describe('에러 처리', () => {
			it('존재하지 않는 게시글에 답글 생성 시 에러를 로그하고 계속 진행해야 한다', async () => {
				const consoleErrorSpy = jest
					.spyOn(console, 'error')
					.mockImplementation(() => {});

				// 존재하지 않는 게시글 ID로 호출
				await expect(
					handleReplyCreated('Boards', 'non_existent_post'),
				).resolves.not.toThrow();

				// 에러가 로그되었는지 확인
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					'댓글 수 증가 실패 Boards/non_existent_post',
					expect.any(Error),
				);

				consoleErrorSpy.mockRestore();
			});
		});
	});

	describe('handleReplyDeleted 함수', () => {
		describe('Boards 컬렉션', () => {
			it('답글 삭제 시 게시글의 commentCount가 1 감소해야 한다', async () => {
				/**
				 * 시나리오:
				 * 1. Boards 컬렉션에 게시글 생성 (commentCount: 5)
				 * 2. handleReplyDeleted 호출
				 * 3. commentCount가 4로 감소했는지 확인
				 */
				await db.collection('Boards').doc(boardsPostId).set({
					title: '테스트 게시글',
					body: '게시글 내용입니다.',
					commentCount: 5,
				});

				await handleReplyDeleted('Boards', boardsPostId);

				const postDoc = await db.collection('Boards').doc(boardsPostId).get();
				const postData = postDoc.data();

				expect(postData?.commentCount).toBe(4);
			});

			it('commentCount가 0인 게시글에서 답글 삭제 시 음수가 되어야 한다', async () => {
				/**
				 * Firestore FieldValue.increment(-1)은 0에서도 -1이 됨
				 * 실제 애플리케이션에서는 이런 상황이 발생하지 않아야 하지만
				 * 테스트에서는 이 동작을 확인
				 */
				await db.collection('Boards').doc(boardsPostId).set({
					title: '테스트 게시글',
					body: '게시글 내용입니다.',
					commentCount: 0,
				});

				await handleReplyDeleted('Boards', boardsPostId);

				const postDoc = await db.collection('Boards').doc(boardsPostId).get();
				const postData = postDoc.data();

				expect(postData?.commentCount).toBe(-1);
			});

			it('여러 개의 답글이 연속으로 삭제되면 commentCount가 정확히 감소해야 한다', async () => {
				await db.collection('Boards').doc(boardsPostId).set({
					title: '테스트 게시글',
					body: '게시글 내용입니다.',
					commentCount: 5,
				});

				// 3개의 답글 순차 삭제
				await handleReplyDeleted('Boards', boardsPostId);
				await handleReplyDeleted('Boards', boardsPostId);
				await handleReplyDeleted('Boards', boardsPostId);

				const postDoc = await db.collection('Boards').doc(boardsPostId).get();
				const postData = postDoc.data();

				expect(postData?.commentCount).toBe(2);
			});
		});

		describe('Communities 컬렉션', () => {
			it('Communities 게시글에서 답글 삭제 시 commentCount가 1 감소해야 한다', async () => {
				await db.collection('Communities').doc(communitiesPostId).set({
					title: '커뮤니티 게시글',
					body: '커뮤니티 게시글 내용입니다.',
					commentCount: 3,
				});

				await handleReplyDeleted('Communities', communitiesPostId);

				const postDoc = await db
					.collection('Communities')
					.doc(communitiesPostId)
					.get();
				const postData = postDoc.data();

				expect(postData?.commentCount).toBe(2);
			});
		});

		describe('에러 처리', () => {
			it('존재하지 않는 게시글에서 답글 삭제 시 에러를 로그하고 계속 진행해야 한다', async () => {
				const consoleErrorSpy = jest
					.spyOn(console, 'error')
					.mockImplementation(() => {});

				// 존재하지 않는 게시글 ID로 호출
				await expect(
					handleReplyDeleted('Boards', 'non_existent_post'),
				).resolves.not.toThrow();

				// 에러가 로그되었는지 확인
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					'댓글 수 감소 실패 Boards/non_existent_post',
					expect.any(Error),
				);

				consoleErrorSpy.mockRestore();
			});
		});
	});

	describe('통합 시나리오', () => {
		it('답글 생성 후 삭제하면 commentCount가 원래 값으로 돌아와야 한다', async () => {
			await db.collection('Boards').doc(boardsPostId).set({
				title: '테스트 게시글',
				body: '게시글 내용입니다.',
				commentCount: 3,
			});

			// 답글 2개 생성
			await handleReplyCreated('Boards', boardsPostId);
			await handleReplyCreated('Boards', boardsPostId);

			let postDoc = await db.collection('Boards').doc(boardsPostId).get();
			expect(postDoc.data()?.commentCount).toBe(5);

			// 답글 2개 삭제
			await handleReplyDeleted('Boards', boardsPostId);
			await handleReplyDeleted('Boards', boardsPostId);

			postDoc = await db.collection('Boards').doc(boardsPostId).get();
			expect(postDoc.data()?.commentCount).toBe(3);
		});

		it('서로 다른 게시글에 대한 답글 처리가 독립적으로 동작해야 한다', async () => {
			// 두 개의 게시글 생성
			await Promise.all([
				db.collection('Boards').doc(boardsPostId).set({
					title: '게시글 1',
					commentCount: 0,
				}),
				db.collection('Communities').doc(communitiesPostId).set({
					title: '게시글 2',
					commentCount: 0,
				}),
			]);

			// 각각 다른 수의 답글 생성
			await handleReplyCreated('Boards', boardsPostId);
			await handleReplyCreated('Boards', boardsPostId);
			await handleReplyCreated('Communities', communitiesPostId);

			// 각 게시글의 commentCount 확인
			const [boardsDoc, communitiesDoc] = await Promise.all([
				db.collection('Boards').doc(boardsPostId).get(),
				db.collection('Communities').doc(communitiesPostId).get(),
			]);

			expect(boardsDoc.data()?.commentCount).toBe(2);
			expect(communitiesDoc.data()?.commentCount).toBe(1);
		});
	});

	/**
	 * 테스트 데이터 클린업 함수
	 */
	async function cleanupTestData() {
		const testPostIds = [
			{ collection: 'Boards', id: boardsPostId },
			{ collection: 'Boards', id: 'non_existent_post' },
			{ collection: 'Communities', id: communitiesPostId },
		];

		const deletePromises = testPostIds.map(({ collection, id }) =>
			db.collection(collection).doc(id).delete(),
		);

		await Promise.all(deletePromises);
	}
});
