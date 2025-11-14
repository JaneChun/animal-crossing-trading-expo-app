const { cleanupTestUser } = require('../firebase-utils/cleanup-test-data');
const { TEST_USER_A } = require('../firebase-utils/test-helpers');
const { runMaestroTest } = require('./maestro-helper');

describe('인증 전체 플로우 테스트', () => {
	// 전체 테스트 전 초기화
	beforeAll(async () => {
		console.log('\n🧪 인증 플로우 테스트 시작\n');
		try {
			await cleanupTestUser(TEST_USER_A.uid);
			runMaestroTest('launch-app.yaml');
			console.log('✅ 테스트 환경 초기화 완료\n');
		} catch (error) {
			console.error('❌ 테스트 환경 초기화 실패:', error.message);
			throw error;
		}
	});

	describe('회원가입 및 인증', () => {
		test('네이버 회원가입', () => {
			expect(() => runMaestroTest('auth/naver-signup-test.yaml')).not.toThrow();
		}, 120000);

		test('로그아웃', () => {
			expect(() => runMaestroTest('auth/logout-test.yaml')).not.toThrow();
		}, 120000);

		test('네이버 로그인', () => {
			expect(() => runMaestroTest('auth/naver-login-test.yaml')).not.toThrow();
		}, 120000);
	});

	describe('계정 관리', () => {
		test('프로필 수정', () => {
			expect(() => runMaestroTest('profile/edit-profile-test.yaml')).not.toThrow();
		}, 120000);

		test('회원탈퇴', () => {
			expect(() => runMaestroTest('auth/delete-account-test.yaml')).not.toThrow();
		}, 120000);
	});

	// 모든 테스트 후 정리
	afterAll(async () => {
		try {
			await cleanupTestUser(TEST_USER_A.uid);
			console.log('✅ 테스트 완료 및 cleanup 완료');
		} catch (error) {
			console.error('❌ cleanup 실패:', error.message);
		}
	});
});
