const {
	cleanupTestUser,
	deleteDocumentsByField,
	deleteSubcollection,
} = require('@/__tests__/firebase-utils/cleanup-test-data');
const { db } = require('@/__tests__/firebase-utils/firebase-admin-setup');
const {
	setupTestUser,
	createTestPost,
	createTestComment,
	TEST_USER_A,
	TEST_USER_B,
} = require('@/__tests__/firebase-utils/test-helpers');

const { runMaestroTest } = require('./maestro-helper');

let testPostId; // 테스트 게시글 ID 저장

describe('거래 전체 플로우 테스트', () => {
	beforeAll(async () => {
		console.log('\n🧪 거래 플로우 테스트 시작\n');

		try {
			// 1. 테스트 유저 설정 (A: 글 작성자, B: 댓글 작성자)
			await setupTestUser(TEST_USER_A);
			await setupTestUser(TEST_USER_B);

			// 2. A 유저 테스트 게시글 생성
			testPostId = await createTestPost({
				title: '거래 테스트 게시글',
				body: '거래 테스트 내용입니다.',
			});

			// 3. B 유저 댓글 생성
			await createTestComment(testPostId, {
				body: '관심있어요!',
				creatorId: TEST_USER_B.uid,
			});

			// 4. 앱 실행
			runMaestroTest('launch-app.yaml');

			console.log('✅ 테스트 환경 초기화 완료\n');
		} catch (error) {
			console.error('❌ 테스트 환경 초기화 실패:', error.message);
			throw error;
		}
	});

	describe('채팅', () => {
		test('채팅 시작 및 메세지 전송', () => {
			expect(() => runMaestroTest('trade/chat-test.yaml')).not.toThrow();
		}, 120000);

		test('거래완료 처리 및 리뷰 전송', () => {
			expect(() => runMaestroTest('trade/compelete-and-review.yaml')).not.toThrow();
		}, 120000);
	});

	afterAll(async () => {
		try {
			// 테스트 댓글 정리
			const postRef = db.collection('Boards').doc(testPostId);
			await deleteSubcollection(postRef, 'Comments');

			// 테스트 게시글 정리
			await deleteDocumentsByField('Boards', 'title', '거래 테스트 게시글');

			// 채팅방 및 메세지 정리
			const chatId = `${TEST_USER_A.uid}_${TEST_USER_B.uid}`;
			const chatRef = db.collection('Chats').doc(chatId);
			await deleteSubcollection(chatRef, 'Messages');
			await chatRef.delete();

			// 리뷰 정리
			await deleteDocumentsByField('Reviews', 'senderId', TEST_USER_A.uid);

			// 테스트 유저 정리
			await cleanupTestUser(TEST_USER_A.uid);
			await cleanupTestUser(TEST_USER_B.uid);

			console.log('✅ 테스트 완료 및 cleanup 완료');
		} catch (error) {
			console.error('❌ cleanup 실패:', error.message);
		}
	});
});
