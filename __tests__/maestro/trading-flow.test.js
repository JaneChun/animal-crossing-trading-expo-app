const { execSync } = require('child_process');
const path = require('path');

describe('거래 전체 플로우 테스트', () => {
	const maestroPath = path.join(__dirname, '../../.maestro');

	const runMaestroTest = (testFile) => {
		return execSync(`maestro test ${maestroPath}/${testFile}`, {
			stdio: 'inherit', // 출력을 콘솔에 표시
		});
	};

	test('1. 거래글 작성', () => {
		expect(() => runMaestroTest('new-post-test.yaml')).not.toThrow();
	}, 60000);

	test('2. 댓글 확인 후 채팅하기', () => {
		expect(() => runMaestroTest('2-comment-and-chat-start.yaml')).not.toThrow();
	}, 120000); // B 유저 댓글 대기 시간 고려

	test('3. 채팅방에서 메시지 주고받기', () => {
		expect(() => runMaestroTest('3-chat-exchange.yaml')).not.toThrow();
	}, 120000); // B 유저 채팅 응답 대기 시간 고려

	test('4. 거래완료 처리 후 리뷰 주고받기', () => {
		expect(() =>
			runMaestroTest('4-trade-completion-and-review.yaml'),
		).not.toThrow();
	}, 60000);
});
