/**
 * naver.ts 모듈 단위 테스트
 * 네이버 OAuth 로그인 처리 함수를 테스트합니다
 */

// axios Mock 설정 - 실제 네이버 API 호출 대신 가짜 응답 반환
jest.mock('axios', () => ({
	get: jest.fn(),
	post: jest.fn(),
	put: jest.fn(),
	delete: jest.fn(),
}));

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

import axios from 'axios';
import { handleNaverLogin } from '../../src/auth/naver';

// axios mock 타입 설정
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Naver 로그인 처리 테스트', () => {
	beforeEach(() => {
		jest.clearAllMocks();

		// console.warn, console.error 무시
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	describe('handleNaverLogin 함수', () => {
		describe('성공 케이스', () => {
			it('유효한 액세스 토큰으로 사용자 정보를 성공적으로 조회해야 한다', async () => {
				/**
				 * 네이버 API 응답 구조:
				 * - resultcode: '00' (성공)
				 * - response.id: 사용자 고유 ID (문자열)
				 * - response.email: 사용자 이메일
				 */
				const mockNaverResponse = {
					data: {
						resultcode: '00',
						message: 'success',
						response: {
							id: 'naver_user_123456789',
							email: 'naveruser@naver.com',
						},
					},
				};

				mockedAxios.get.mockResolvedValue(mockNaverResponse);

				const validAccessToken = 'valid_naver_access_token_123';

				const result = await handleNaverLogin(validAccessToken);

				/**
				 * 반환값 검증:
				 * 1. 네이버 ID가 문자열로 그대로 사용되는지 확인
				 * 2. 이메일이 올바르게 추출되는지 확인
				 */
				expect(result).toEqual({
					providerId: 'naver_user_123456789',
					email: 'naveruser@naver.com',
				});

				/**
				 * Mock 함수 호출 검증:
				 * 1. 올바른 URL로 요청했는지 확인
				 * 2. 올바른 헤더(Authorization)를 포함했는지 확인
				 * 3. 정확히 한 번만 호출되었는지 확인
				 */
				expect(mockedAxios.get).toHaveBeenCalledWith(
					'https://openapi.naver.com/v1/nid/me',
					{
						headers: {
							Authorization: `Bearer ${validAccessToken}`,
						},
					},
				);
				expect(mockedAxios.get).toHaveBeenCalledTimes(1);
			});

			it('네이버 ID가 숫자로 제공되어도 문자열로 변환해야 한다', async () => {
				const mockNaverResponse = {
					data: {
						resultcode: '00',
						message: 'success',
						response: {
							id: 123456789, // 숫자로 제공
							email: 'numberid@naver.com',
						},
					},
				};

				mockedAxios.get.mockResolvedValue(mockNaverResponse);

				const result = await handleNaverLogin('valid_token');

				// 숫자 ID도 문자열로 변환되어야 함
				expect(result.providerId).toBe('123456789');
				expect(typeof result.providerId).toBe('string');
			});

			it('네이버 API 응답에 추가 필드가 있어도 필요한 정보만 추출해야 한다', async () => {
				/**
				 * 네이버 API는 선택적으로 다양한 정보를 제공할 수 있음
				 * 하지만 우리는 id와 email만 필요
				 */
				const mockNaverResponse = {
					data: {
						resultcode: '00',
						message: 'success',
						response: {
							id: 'naver_123',
							email: 'test@naver.com',
							// 추가 필드들 (선택사항)
							name: '테스트유저',
							nickname: '닉네임',
							profile_image: 'https://example.com/image.jpg',
							age: '20-29',
							gender: 'M',
							birthday: '01-01',
							birthyear: '1990',
							mobile: '010-1234-5678',
						},
					},
				};

				mockedAxios.get.mockResolvedValue(mockNaverResponse);

				const result = await handleNaverLogin('valid_token');

				// 필요한 정보만 추출되었는지 확인
				expect(result).toEqual({
					providerId: 'naver_123',
					email: 'test@naver.com',
				});

				// 추가 필드들은 포함되지 않았는지 확인
				expect(result).not.toHaveProperty('name');
				expect(result).not.toHaveProperty('nickname');
				expect(result).not.toHaveProperty('profile_image');
			});
		});
		describe('실패 케이스', () => {
			it('액세스 토큰이 없으면 invalid-argument 에러를 throw해야 한다', async () => {
				// 빈 문자열로 테스트
				await expect(handleNaverLogin('')).rejects.toThrow(
					'accessToken이 누락되었습니다.',
				);

				// undefined로 테스트
				await expect(handleNaverLogin(undefined as any)).rejects.toThrow(
					'accessToken이 누락되었습니다.',
				);

				/**
				 * API 호출이 일어나지 않았는지 확인:
				 * 토큰이 없으면 API 호출 자체가 일어나면 안 됨
				 */
				expect(mockedAxios.get).not.toHaveBeenCalled();
			});

			it('resultcode가 "00"이 아니면 unauthenticated 에러를 throw해야 한다', async () => {
				const errorResponse = {
					data: {
						resultcode: '0', // '00'이 아닌 '0'
						message: 'Invalid result code test',
						response: {
							id: 'test_id',
							email: 'test@test.com',
						},
					},
				};

				mockedAxios.get.mockResolvedValue(errorResponse);

				await expect(handleNaverLogin('test_token')).rejects.toThrow(
					'accessToken이 유효하지 않거나 만료되었습니다.',
				);
			});

			it('네트워크 에러가 발생하면 internal 에러를 throw해야 한다', async () => {
				// 네트워크 에러 (axios 요청 자체 실패)
				mockedAxios.get.mockRejectedValue(new Error('Network Error'));

				await expect(handleNaverLogin('valid_token')).rejects.toThrow(
					'Naver 사용자 정보 조회 실패',
				);
			});
		});
	});
});
