const {
	cleanupTestUser,
	deleteDocumentsByField,
} = require('@/__tests__/firebase-utils/cleanup-test-data');
const {
	setupTestUser,
	checkPostExists,
	TEST_USER_A,
} = require('@/__tests__/firebase-utils/test-helpers');

const { runMaestroTest } = require('./maestro-helper');

describe('게시글 전체 플로우 테스트', () => {
	beforeAll(async () => {
		console.log('\n🧪 게시글 플로우 테스트 시작\n');

		try {
			// 1. 테스트 유저 설정
			await setupTestUser(TEST_USER_A);

			// 2. 앱 실행
			runMaestroTest('launch-app.yaml');

			console.log('✅ 테스트 환경 초기화 완료\n');
		} catch (error) {
			console.error('❌ 테스트 환경 초기화 실패:', error.message);
			throw error;
		}
	});

	describe('게시글 작성', () => {
		test('새 글 작성 유효성 검사', () => {
			expect(() => runMaestroTest('posts/validation-test.yaml')).not.toThrow();
		}, 120000);

		test('새 글 작성', async () => {
			expect(() => runMaestroTest('posts/create-post-test.yaml')).not.toThrow();

			// 게시글이 실제로 생성되었는지 검증
			const postExists = await checkPostExists('테스트 게시글');
			expect(postExists).toBe(true);
		}, 120000);
	});

	describe('게시글 수정 및 삭제', () => {
		test('게시글 수정', async () => {
			expect(() => runMaestroTest('posts/edit-post-test.yaml')).not.toThrow();

			// 수정된 게시글이 존재하는지 검증
			const postExists = await checkPostExists('수정된 테스트 게시글');
			expect(postExists).toBe(true);
		}, 120000);

		test('게시글 삭제', () => {
			expect(() => runMaestroTest('posts/delete-post-test.yaml')).not.toThrow();
		}, 120000);
	});

	afterAll(async () => {
		try {
			// 테스트 유저 정리
			await cleanupTestUser(TEST_USER_A.uid);

			// 테스트 게시글 정리
			await deleteDocumentsByField('Boards', 'title', '테스트 게시글');
			await deleteDocumentsByField('Boards', 'title', '수정된 테스트 게시글');

			console.log('✅ 테스트 완료 및 cleanup 완료');
		} catch (error) {
			console.error('❌ cleanup 실패:', error.message);
		}
	});
});
