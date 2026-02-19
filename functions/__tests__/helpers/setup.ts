/**
 * Jest 전역 Setup 파일
 * 모든 테스트 파일에서 자동으로 적용되는 설정
 */

// 모든 테스트 전에 mock 초기화
beforeEach(() => {
	jest.clearAllMocks();
});

// 프로덕션 코드의 console.warn, console.error 가 테스트 출력을 오염시키지 않도록 mock 처리
beforeAll(() => {
	jest.spyOn(console, 'warn').mockImplementation(() => {});
	jest.spyOn(console, 'error').mockImplementation(() => {});
});

// 모든 테스트 후에 mock 복원
afterAll(() => {
	jest.restoreAllMocks();
});

// 통합 테스트에 더 긴 타임아웃 허용
jest.setTimeout(10000);
