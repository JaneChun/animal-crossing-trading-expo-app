/**
 * kakao.ts 모듈 단위 테스트
 * 카카오 OAuth 로그인 처리 함수를 테스트합니다
 */

import { createMockAxios, createMockHttpsError } from '../helpers';

// axios Mock 설정 - 공통 헬퍼 활용
jest.mock('axios', () => createMockAxios());

// Firebase Functions Mock 설정 - 공통 헬퍼 활용
const MockHttpsError = createMockHttpsError();
jest.mock('firebase-functions', () => ({
	https: {
		HttpsError: MockHttpsError,
		onCall: jest.fn(),
	},
}));

import axios from 'axios';
import { handleKakaoLogin } from '../../src/auth/kakao';

// axios mock 타입 설정
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Kakao 로그인 처리 테스트', () => {
	describe('handleKakaoLogin 함수', () => {
		describe('성공 케이스', () => {
			it('유효한 액세스 토큰으로 사용자 정보를 성공적으로 조회해야 한다', async () => {
				/**
				 * 카카오 API 응답 구조:
				 * - id: 사용자 고유 ID (숫자)
				 * - kakao_account.email: 사용자 이메일
				 */
				const mockKakaoResponse = {
					data: {
						id: 12345,
						kakao_account: {
							email: 'testuser@kakao.com',
						},
					},
				};

				mockedAxios.get.mockResolvedValue(mockKakaoResponse);

				const validAccessToken = 'valid_kakao_access_token_123';

				const result = await handleKakaoLogin(validAccessToken);

				/**
				 * 반환값 검증:
				 * 1. 카카오 ID가 숫자에서 문자열로 변환되는지 확인
				 * 2. 이메일이 올바르게 추출되는지 확인
				 */
				expect(result).toEqual({
					providerId: '12345',
					email: 'testuser@kakao.com',
				});

				/**
				 * Mock 함수 호출 검증:
				 * 1. 올바른 URL로 요청했는지 확인
				 * 2. 올바른 헤더(Authorization)를 포함했는지 확인
				 * 3. 정확히 한 번만 호출되었는지 확인
				 */
				expect(mockedAxios.get).toHaveBeenCalledWith(
					'https://kapi.kakao.com/v2/user/me',
					{
						headers: {
							Authorization: `Bearer ${validAccessToken}`,
						},
					},
				);
				expect(mockedAxios.get).toHaveBeenCalledTimes(1);
			});

			it('카카오 ID가 숫자로 제공되어도 문자열로 변환해야 한다', async () => {
				const mockKakaoResponse = {
					data: {
						id: 2468135790,
						kakao_account: {
							email: 'bignumber@kakao.com',
						},
					},
				};

				mockedAxios.get.mockResolvedValue(mockKakaoResponse);

				const result = await handleKakaoLogin('valid_token');

				// 큰 숫자 ID도 문자열로 변환되어야 함
				expect(result.providerId).toBe('2468135790');
				expect(typeof result.providerId).toBe('string');
			});

			it('카카오 API 응답에 추가 필드가 있어도 필요한 정보만 추출해야 한다', async () => {
				/**
				 * 카카오 API는 다양한 정보를 제공할 수 있음
				 * 하지만 우리는 id와 email만 필요
				 */
				const mockKakaoResponse = {
					data: {
						id: 987654321,
						connected_at: '2024-01-15T10:30:00Z',
						kakao_account: {
							profile_nickname_needs_agreement: false,
							has_email: true,
							email_needs_agreement: false,
							is_email_valid: true,
							is_email_verified: true,
							email: 'test@kakao.com',
							// 추가 필드들 (선택사항)
							profile: {
								nickname: '테스트유저',
								thumbnail_image_url: 'https://example.com/thumb.jpg',
								profile_image_url: 'https://example.com/profile.jpg',
								is_default_image: false,
							},
							has_age_range: true,
							age_range: '20~29',
							has_birthday: true,
							birthday: '1225',
							birthday_type: 'SOLAR',
						},
						// 기타 추가 필드들
						properties: {
							nickname: '테스트',
							profile_image: 'https://example.com/image.jpg',
							thumbnail_image: 'https://example.com/thumb.jpg',
						},
					},
				};

				mockedAxios.get.mockResolvedValue(mockKakaoResponse);

				const result = await handleKakaoLogin('valid_token');

				// 필요한 정보만 추출되었는지 확인
				expect(result).toEqual({
					providerId: '987654321',
					email: 'test@kakao.com',
				});

				// 추가 필드들은 포함되지 않았는지 확인
				expect(result).not.toHaveProperty('connected_at');
				expect(result).not.toHaveProperty('profile');
				expect(result).not.toHaveProperty('properties');
			});
		});

		describe('실패 케이스', () => {
			it('액세스 토큰이 없으면 invalid-argument 에러를 throw해야 한다', async () => {
				// 빈 문자열로 테스트
				await expect(handleKakaoLogin('')).rejects.toThrow(
					'accessToken이 누락되었습니다.',
				);

				// undefined로 테스트
				await expect(handleKakaoLogin(undefined as any)).rejects.toThrow(
					'accessToken이 누락되었습니다.',
				);

				/**
				 * API 호출이 일어나지 않았는지 확인:
				 * 토큰이 없으면 API 호출 자체가 일어나면 안 됨
				 */
				expect(mockedAxios.get).not.toHaveBeenCalled();
			});

			it('네트워크 에러가 발생하면 internal 에러를 throw해야 한다', async () => {
				// 네트워크 에러 (axios 요청 자체 실패)
				mockedAxios.get.mockRejectedValue(new Error('Network Error'));

				await expect(handleKakaoLogin('valid_token')).rejects.toThrow(
					'Kakao 사용자 정보 조회 실패',
				);
			});
		});
	});
});
