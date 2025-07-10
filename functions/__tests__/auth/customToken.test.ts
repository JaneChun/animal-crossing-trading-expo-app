/**
 * customToken.ts 모듈 단위 테스트
 * Firebase Custom Token 생성 함수를 테스트합니다
 */

// Firebase Functions Mock 설정 - HttpsError 생성을 위한 Mock
const MockHttpsError = jest
	.fn()
	.mockImplementation((code, message, details) => {
		// 실제 Error 객체를 기반으로 Https에러를 시뮬레이션
		const error = new Error(message);
		error.name = 'HttpsError';
		(error as any).code = code;
		(error as any).details = details;
		// instanceof 검사를 위해 constructor 설정
		Object.setPrototypeOf(error, MockHttpsError.prototype);
		return error;
	});

jest.mock('firebase-functions', () => ({
	https: {
		HttpsError: MockHttpsError,
		onCall: jest.fn(),
	},
}));

// Firebase Admin Auth Mock 설정
const mockCreateCustomToken = jest.fn();
jest.mock('../../src/utils/common', () => ({
	...jest.requireActual('../../src/utils/common'),
	auth: {
		createCustomToken: mockCreateCustomToken,
	},
	isUserRestrictedFromRejoining: jest.fn(),
}));

// OAuth 핸들러 함수들 Mock 설정
const mockHandleKakaoLogin = jest.fn();
const mockHandleNaverLogin = jest.fn();
const mockHandleAppleLogin = jest.fn();

jest.mock('../../src/auth/kakao', () => ({
	handleKakaoLogin: mockHandleKakaoLogin,
}));

jest.mock('../../src/auth/naver', () => ({
	handleNaverLogin: mockHandleNaverLogin,
}));

jest.mock('../../src/auth/apple', () => ({
	handleAppleLogin: mockHandleAppleLogin,
}));

import { createFirebaseCustomToken } from '../../src/auth/customToken';
import { isUserRestrictedFromRejoining } from '../../src/utils/common';

// Mock된 함수들의 타입 설정
const mockIsUserRestrictedFromRejoining =
	isUserRestrictedFromRejoining as jest.MockedFunction<
		typeof isUserRestrictedFromRejoining
	>;

describe('Custom Token 생성 테스트', () => {
	beforeEach(() => {
		jest.clearAllMocks();

		// console.warn, console.error 무시
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	describe('createFirebaseCustomToken 함수', () => {
		describe('성공 케이스', () => {
			it('Kakao OAuth로 Custom Token을 성공적으로 생성해야 한다', async () => {
				/**
				 * Kakao 로그인 성공 시나리오:
				 * 1. handleKakaoLogin 성공
				 * 2. 재가입 제한 확인 통과
				 * 3. Firebase Custom Token 생성 성공
				 */
				const kakaoUserInfo = {
					providerId: 'kakao_user_123',
					email: 'kakaouser@kakao.com',
				};

				mockHandleKakaoLogin.mockResolvedValue(kakaoUserInfo);
				mockIsUserRestrictedFromRejoining.mockResolvedValue(false);
				mockCreateCustomToken.mockResolvedValue('firebase_custom_token_123');

				const request = {
					oauthType: 'kakao',
					accessToken: 'valid_kakao_access_token',
				};

				const result = await createFirebaseCustomToken(request);

				/**
				 * 반환값 검증:
				 * 1. Firebase Token이 올바르게 반환되는지 확인
				 * 2. 사용자 이메일이 올바르게 포함되는지 확인
				 */
				expect(result).toEqual({
					firebaseToken: 'firebase_custom_token_123',
					user: { email: 'kakaouser@kakao.com' },
				});

				/**
				 * Mock 함수 호출 검증:
				 * 1. handleKakaoLogin이 올바른 매개변수로 호출되었는지 확인
				 * 2. 재가입 제한 확인이 올바른 providerId로 호출되었는지 확인
				 * 3. Custom Token 생성이 올바른 providerId로 호출되었는지 확인
				 */
				expect(mockHandleKakaoLogin).toHaveBeenCalledWith(
					'valid_kakao_access_token',
				);
				expect(mockIsUserRestrictedFromRejoining).toHaveBeenCalledWith(
					'kakao_user_123',
				);
				expect(mockCreateCustomToken).toHaveBeenCalledWith('kakao_user_123');
			});

			it('Naver OAuth로 Custom Token을 성공적으로 생성해야 한다', async () => {
				const naverUserInfo = {
					providerId: 'naver_user_456',
					email: 'naveruser@naver.com',
				};

				mockHandleNaverLogin.mockResolvedValue(naverUserInfo);
				mockIsUserRestrictedFromRejoining.mockResolvedValue(false);
				mockCreateCustomToken.mockResolvedValue('firebase_custom_token_456');

				const request = {
					oauthType: 'naver',
					accessToken: 'valid_naver_access_token',
				};

				const result = await createFirebaseCustomToken(request);

				expect(result).toEqual({
					firebaseToken: 'firebase_custom_token_456',
					user: { email: 'naveruser@naver.com' },
				});

				expect(mockHandleNaverLogin).toHaveBeenCalledWith(
					'valid_naver_access_token',
				);
				expect(mockIsUserRestrictedFromRejoining).toHaveBeenCalledWith(
					'naver_user_456',
				);
				expect(mockCreateCustomToken).toHaveBeenCalledWith('naver_user_456');
			});

			it('Apple OAuth로 Custom Token을 성공적으로 생성해야 한다', async () => {
				const appleUserInfo = {
					providerId: 'apple_user_789',
					email: 'appleuser@privaterelay.appleid.com',
				};

				mockHandleAppleLogin.mockResolvedValue(appleUserInfo);
				mockIsUserRestrictedFromRejoining.mockResolvedValue(false);
				mockCreateCustomToken.mockResolvedValue('firebase_custom_token_789');

				const request = {
					oauthType: 'apple',
					idToken: 'valid_apple_id_token',
					rawNonce: 'valid_raw_nonce',
				};

				const result = await createFirebaseCustomToken(request);

				expect(result).toEqual({
					firebaseToken: 'firebase_custom_token_789',
					user: { email: 'appleuser@privaterelay.appleid.com' },
				});

				expect(mockHandleAppleLogin).toHaveBeenCalledWith(
					'valid_apple_id_token',
					'valid_raw_nonce',
				);
				expect(mockIsUserRestrictedFromRejoining).toHaveBeenCalledWith(
					'apple_user_789',
				);
				expect(mockCreateCustomToken).toHaveBeenCalledWith('apple_user_789');
			});
		});

		describe('실패 케이스', () => {
			it('oauthType이 없으면 invalid-argument 에러를 throw해야 한다', async () => {
				// 빈 문자열
				const request = {
					oauthType: '',
					accessToken: 'valid_token',
				};

				await expect(createFirebaseCustomToken(request)).rejects.toThrow(
					'oauthType가 누락되었습니다.',
				);

				// undefined
				const request2 = {
					oauthType: undefined as any,
					accessToken: 'valid_token',
				};

				await expect(createFirebaseCustomToken(request2)).rejects.toThrow(
					'oauthType가 누락되었습니다.',
				);

				/**
				 * OAuth 핸들러들이 호출되지 않았는지 확인:
				 * oauthType이 없으면 OAuth 처리 자체가 일어나면 안 됨
				 */
				expect(mockHandleKakaoLogin).not.toHaveBeenCalled();
				expect(mockHandleNaverLogin).not.toHaveBeenCalled();
				expect(mockHandleAppleLogin).not.toHaveBeenCalled();
			});

			it('지원하지 않는 oauthType이면 invalid-argument 에러를 throw해야 한다', async () => {
				const request = {
					oauthType: 'google', // 지원하지 않는 타입
					accessToken: 'valid_token',
				};

				await expect(createFirebaseCustomToken(request)).rejects.toThrow(
					'지원하지 않는 oauthType입니다.',
				);

				// OAuth 핸들러들이 호출되지 않았는지 확인
				expect(mockHandleKakaoLogin).not.toHaveBeenCalled();
				expect(mockHandleNaverLogin).not.toHaveBeenCalled();
				expect(mockHandleAppleLogin).not.toHaveBeenCalled();
			});

			it('Kakao 로그인에서 에러가 발생하면 그대로 전파해야 한다', async () => {
				// Kakao 로그인 실패
				const kakaoError = new MockHttpsError(
					'invalid-argument',
					'accessToken이 누락되었습니다.',
				);
				mockHandleKakaoLogin.mockRejectedValue(kakaoError);

				const request = {
					oauthType: 'kakao',
					accessToken: 'invalid_token',
				};

				await expect(createFirebaseCustomToken(request)).rejects.toThrow(
					'accessToken이 누락되었습니다.',
				);

				// Kakao 로그인은 시도되었지만, 후속 처리는 일어나지 않았는지 확인
				expect(mockHandleKakaoLogin).toHaveBeenCalledWith('invalid_token');
				expect(mockIsUserRestrictedFromRejoining).not.toHaveBeenCalled();
				expect(mockCreateCustomToken).not.toHaveBeenCalled();
			});

			it('Naver 로그인에서 에러가 발생하면 그대로 전파해야 한다', async () => {
				// Naver 로그인 실패
				const naverError = new MockHttpsError(
					'unauthenticated',
					'accessToken이 유효하지 않거나 만료되었습니다.',
				);
				mockHandleNaverLogin.mockRejectedValue(naverError);

				const request = {
					oauthType: 'naver',
					accessToken: 'invalid_token',
				};

				await expect(createFirebaseCustomToken(request)).rejects.toThrow(
					'accessToken이 유효하지 않거나 만료되었습니다.',
				);

				expect(mockHandleNaverLogin).toHaveBeenCalledWith('invalid_token');
				expect(mockIsUserRestrictedFromRejoining).not.toHaveBeenCalled();
				expect(mockCreateCustomToken).not.toHaveBeenCalled();
			});

			it('Apple 로그인에서 에러가 발생하면 그대로 전파해야 한다', async () => {
				// Apple 로그인 실패
				const appleError = new MockHttpsError(
					'invalid-argument',
					'idToken과 rawNonce가 누락되었습니다.',
				);
				mockHandleAppleLogin.mockRejectedValue(appleError);

				const request = {
					oauthType: 'apple',
					idToken: '',
					rawNonce: '',
				};

				await expect(createFirebaseCustomToken(request)).rejects.toThrow(
					'idToken과 rawNonce가 누락되었습니다.',
				);

				expect(mockHandleAppleLogin).toHaveBeenCalledWith('', '');
				expect(mockIsUserRestrictedFromRejoining).not.toHaveBeenCalled();
				expect(mockCreateCustomToken).not.toHaveBeenCalled();
			});

			it('30일 이내 재가입 제한 계정이면 failed-precondition 에러를 throw해야 한다', async () => {
				// OAuth 로그인은 성공하지만 재가입 제한
				const kakaoUserInfo = {
					providerId: 'restricted_user_123',
					email: 'restricteduser@kakao.com',
				};

				mockHandleKakaoLogin.mockResolvedValue(kakaoUserInfo);
				mockIsUserRestrictedFromRejoining.mockResolvedValue(true); // 재가입 제한

				const request = {
					oauthType: 'kakao',
					accessToken: 'valid_token',
				};

				await expect(createFirebaseCustomToken(request)).rejects.toThrow(
					'30일 이내 재가입이 제한된 계정입니다.',
				);

				// OAuth 로그인과 재가입 제한 확인은 실행되었지만, Custom Token 생성은 안 되었는지 확인
				expect(mockHandleKakaoLogin).toHaveBeenCalledWith('valid_token');
				expect(mockIsUserRestrictedFromRejoining).toHaveBeenCalledWith(
					'restricted_user_123',
				);
				expect(mockCreateCustomToken).not.toHaveBeenCalled();
			});

			it('Firebase Custom Token 생성에서 에러가 발생하면 internal 에러를 throw해야 한다', async () => {
				// OAuth 로그인과 재가입 제한 확인은 성공하지만 Firebase Token 생성 실패
				const kakaoUserInfo = {
					providerId: 'kakao_user_123',
					email: 'kakaouser@kakao.com',
				};

				mockHandleKakaoLogin.mockResolvedValue(kakaoUserInfo);
				mockIsUserRestrictedFromRejoining.mockResolvedValue(false);
				mockCreateCustomToken.mockRejectedValue(
					new Error('Firebase Admin SDK error'),
				);

				const request = {
					oauthType: 'kakao',
					accessToken: 'valid_token',
				};

				await expect(createFirebaseCustomToken(request)).rejects.toThrow(
					'Firebase Custom Token 생성 중 오류가 발생했습니다.',
				);

				// 모든 사전 단계는 성공했지만 Custom Token 생성에서 실패
				expect(mockHandleKakaoLogin).toHaveBeenCalledWith('valid_token');
				expect(mockIsUserRestrictedFromRejoining).toHaveBeenCalledWith(
					'kakao_user_123',
				);
				expect(mockCreateCustomToken).toHaveBeenCalledWith('kakao_user_123');
			});

			it('재가입 제한 확인에서 에러가 발생하면 internal 에러를 throw해야 한다', async () => {
				// OAuth 로그인은 성공하지만 재가입 제한 확인에서 일반 에러 발생
				const kakaoUserInfo = {
					providerId: 'kakao_user_123',
					email: 'kakaouser@kakao.com',
				};

				mockHandleKakaoLogin.mockResolvedValue(kakaoUserInfo);
				mockIsUserRestrictedFromRejoining.mockRejectedValue(
					new Error('Database connection error'),
				);

				const request = {
					oauthType: 'kakao',
					accessToken: 'valid_token',
				};

				await expect(createFirebaseCustomToken(request)).rejects.toThrow(
					'Firebase Custom Token 생성 중 오류가 발생했습니다.',
				);

				expect(mockHandleKakaoLogin).toHaveBeenCalledWith('valid_token');
				expect(mockIsUserRestrictedFromRejoining).toHaveBeenCalledWith(
					'kakao_user_123',
				);
				expect(mockCreateCustomToken).not.toHaveBeenCalled();
			});
		});
	});
});
