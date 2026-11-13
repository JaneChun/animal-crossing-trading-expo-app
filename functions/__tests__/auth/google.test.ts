/**
 * google.ts 모듈 단위 테스트
 * Google 로그인 처리 함수를 테스트합니다
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

jest.mock('firebase-functions/params', () => ({
	defineString: jest.fn(() => ({ value: () => 'test_web_client_id' })),
}));

// Google ID 토큰 검증 Mock 설정
const mockVerifyIdToken = jest.fn();
jest.mock('google-auth-library', () => ({
	OAuth2Client: jest.fn().mockImplementation(() => ({
		verifyIdToken: mockVerifyIdToken,
	})),
}));

import { handleGoogleLogin } from '../../src/auth/google';

describe('Google 로그인 처리 테스트', () => {
	describe('handleGoogleLogin 함수', () => {
		describe('성공 케이스', () => {
			it('검증된 토큰의 sub와 email을 반환해야 한다', async () => {
				mockVerifyIdToken.mockResolvedValue({
					getPayload: () => ({
						sub: 'google_user_101',
						email: 'googleuser@gmail.com',
					}),
				});

				const result = await handleGoogleLogin('valid_google_id_token');

				expect(result).toEqual({
					providerId: 'google_user_101',
					email: 'googleuser@gmail.com',
				});
				expect(mockVerifyIdToken).toHaveBeenCalledWith({
					idToken: 'valid_google_id_token',
					audience: 'test_web_client_id',
				});
			});
		});

		describe('실패 케이스', () => {
			it('idToken이 없으면 invalid-argument 에러를 throw해야 한다', async () => {
				await expect(handleGoogleLogin('')).rejects.toThrow(
					'idToken이 누락되었습니다.',
				);
				await expect(handleGoogleLogin(undefined as any)).rejects.toThrow(
					'idToken이 누락되었습니다.',
				);
				expect(mockVerifyIdToken).not.toHaveBeenCalled();
			});

			it('토큰 검증에 실패하면 unauthenticated 에러를 throw해야 한다', async () => {
				mockVerifyIdToken.mockRejectedValue(new Error('Token used too late'));

				await expect(handleGoogleLogin('expired_token')).rejects.toMatchObject(
					{
						code: 'unauthenticated',
						message: '유효하지 않은 Google ID 토큰입니다.',
					},
				);
			});

			it('페이로드에 sub가 없으면 internal 에러를 throw해야 한다', async () => {
				mockVerifyIdToken.mockResolvedValue({ getPayload: () => undefined });

				await expect(handleGoogleLogin('valid_token')).rejects.toMatchObject({
					code: 'internal',
					message: 'Google 사용자 정보 조회 실패',
				});
			});
		});
	});
});
