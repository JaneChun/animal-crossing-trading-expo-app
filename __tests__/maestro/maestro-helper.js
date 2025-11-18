const path = require('path');
const { execSync } = require('child_process');

const maestroPath = path.join(__dirname, '../../.maestro');

/**
 * Maestro 테스트 실행 헬퍼 함수
 * @param {string} testFile - .maestro/ 기준 상대 경로
 * @throws {Error} Maestro 테스트 실패 시 에러 발생
 */
const runMaestroTest = (testFile) => {
	try {
		execSync(`maestro test ${maestroPath}/${testFile}`, {
			stdio: 'inherit', // 출력을 콘솔에 표시
		});
		return true;
	} catch (error) {
		console.error(`❌ Maestro test failed: ${testFile}`);
		console.error(`Exit code: ${error.status}`);
		if (error.stdout) console.error(`Stdout: ${error.stdout}`);
		if (error.stderr) console.error(`Stderr: ${error.stderr}`);
		throw error;
	}
};

module.exports = { runMaestroTest };
