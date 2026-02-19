/**
 * apple.ts 모듈 단위 테스트
 * Apple 로그인 처리 함수를 테스트합니다
 */

import { createMockHttpsError } from '../helpers';

// Firebase Functions Mock 설정 - 공통 헬퍼 활용
const MockHttpsError = createMockHttpsError();
jest.mock('firebase-functions', () => ({
	https: {
		HttpsError: MockHttpsError,
		onCall: jest.fn(),
	},
}));

import { handleAppleLogin } from '../../src/auth/apple';

describe('Apple 로그인 처리 테스트', () => {
	describe('handleAppleLogin 함수', () => {
		describe('실패 케이스', () => {
			it('idToken이 없으면 invalid-argument 에러를 throw해야 한다', async () => {
				// 빈 문자열로 테스트
				await expect(handleAppleLogin('', 'test_nonce')).rejects.toThrow(
					'idToken과 rawNonce가 누락되었습니다.',
				);

				// undefined로 테스트
				await expect(
					handleAppleLogin(undefined as any, 'test_nonce'),
				).rejects.toThrow('idToken과 rawNonce가 누락되었습니다.');
			});

			it('rawNonce가 없으면 invalid-argument 에러를 throw해야 한다', async () => {
				// 빈 문자열로 테스트
				await expect(handleAppleLogin('valid.token', '')).rejects.toThrow(
					'idToken과 rawNonce가 누락되었습니다.',
				);

				// undefined로 테스트
				await expect(
					handleAppleLogin('valid.token', undefined as any),
				).rejects.toThrow('idToken과 rawNonce가 누락되었습니다.');
			});

			it('유효하지 않은 JWT 토큰이면 invalid-argument 에러를 throw해야 한다', async () => {
				// 유효하지 않은 JWT 형식 (점이 2개 미만)
				await expect(
					handleAppleLogin('invalid.token', 'test_nonce'),
				).rejects.toThrow();
			});

			it('kid가 없는 JWT 토큰은 invalid-argument 에러를 throw해야 한다', async () => {
				// kid가 없는 JWT 토큰 (실제 JWT는 아니지만 형식은 맞춤)
				const invalidToken =
					'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.signature';

				await expect(
					handleAppleLogin(invalidToken, 'test_nonce'),
				).rejects.toThrow('유효하지 않은 Apple ID 토큰입니다. (kid 누락)');
			});

			it('네트워크 에러가 발생하면 internal 에러를 throw해야 한다', async () => {
				// JWKS 연결 실패를 시뮬레이션하기 위해 kid는 있지만 실제로는 연결할 수 없는 토큰
				const tokenWithKid =
					'eyJhbGciOiJSUzI1NiIsImtpZCI6IkFCQ0RFRiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.signature';

				// 네트워크 에러가 발생하면 결국 internal 에러로 변환되어야 함
				await expect(
					handleAppleLogin(tokenWithKid, 'test_nonce'),
				).rejects.toThrow('Apple 사용자 정보 조회 실패');
			});
		});
	});
});
