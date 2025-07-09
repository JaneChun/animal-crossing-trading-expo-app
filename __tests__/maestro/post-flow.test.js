const { execSync } = require('child_process');
const path = require('path');

describe('게시글 전체 플로우 테스트', () => {
	const maestroPath = path.join(__dirname, '../../.maestro');

	const runMaestroTest = (testFile) => {
		return execSync(`maestro test ${maestroPath}/${testFile}`, {
			stdio: 'inherit' // 출력을 콘솔에 표시
		});
	};

	test('새글 작성 유효성 검사 테스트', () => {
		expect(() => runMaestroTest('new-post-validation-test.yaml')).not.toThrow();
	}, 60000);

	test('새글 작성 테스트', () => {
		expect(() => runMaestroTest('new-post-test.yaml')).not.toThrow();
	}, 60000);

	test('게시글 수정 테스트', () => {
		expect(() => runMaestroTest('edit-post-test.yaml')).not.toThrow();
	}, 60000);

	test('게시글 삭제 테스트', () => {
		expect(() => runMaestroTest('delete-post-test.yaml')).not.toThrow();
	}, 60000);
});
