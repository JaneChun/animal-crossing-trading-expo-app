const path = require('path');
const { execSync } = require('child_process');

const maestroPath = path.join(__dirname, '../../.maestro');

/**
 * Maestro 테스트 실행 헬퍼 함수
 * @param {string} testFile - .maestro/ 기준 상대 경로
 */
const runMaestroTest = (testFile) => {
	return execSync(`maestro test ${maestroPath}/${testFile}`, {
		stdio: 'inherit', // 출력을 콘솔에 표시
	});
};

module.exports = { runMaestroTest };
