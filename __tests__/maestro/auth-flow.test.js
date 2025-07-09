const { execSync } = require('child_process');
const path = require('path');

describe('인증 전체 플로우 테스트', () => {
	const maestroPath = path.join(__dirname, '../../.maestro');

	const runMaestroTest = (testFile) => {
		return execSync(`maestro test ${maestroPath}/${testFile}`, {
			stdio: 'inherit', // 출력을 콘솔에 표시
		});
	};

	test('회원가입 테스트', () => {
		expect(() => runMaestroTest('naver-signup-test.yaml')).not.toThrow();
	}, 120000);

	test('로그아웃 테스트', () => {
		expect(() => runMaestroTest('logout-test.yaml')).not.toThrow();
	}, 60000);

	test('로그인 테스트', () => {
		expect(() => runMaestroTest('naver-login-test.yaml')).not.toThrow();
	}, 60000);

	test('프로필 수정 테스트', () => {
		expect(() => runMaestroTest('edit-profile-test.yaml')).not.toThrow();
	}, 60000);

	test('회원탈퇴 테스트', () => {
		expect(() => runMaestroTest('delete-account-test.yaml')).not.toThrow();
	}, 120000);
});
