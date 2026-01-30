/**
 * crypto.ts 모듈 단위 테스트
 * SHA-256 해시 생성 함수를 테스트합니다
 */

import { createSHA256Hash } from '../../src/utils/crypto';

describe('crypto 유틸리티 함수 테스트', () => {
	describe('createSHA256Hash 함수', () => {
		describe('기본 동작', () => {
			it('동일한 입력에 대해 일관된 해시 값을 반환해야 한다', () => {
				const input = 'test_string_123';

				const hash1 = createSHA256Hash(input);
				const hash2 = createSHA256Hash(input);

				expect(hash1).toBe(hash2);
			});

			it('다른 입력에 대해 다른 해시 값을 반환해야 한다', () => {
				const input1 = 'string_a';
				const input2 = 'string_b';

				const hash1 = createSHA256Hash(input1);
				const hash2 = createSHA256Hash(input2);

				expect(hash1).not.toBe(hash2);
			});

			it('64자의 16진수 문자열을 반환해야 한다', () => {
				const input = 'any_string';

				const hash = createSHA256Hash(input);

				// SHA-256은 256비트 = 32바이트 = 64자 16진수
				expect(hash).toHaveLength(64);
				// 16진수 문자만 포함하는지 확인
				expect(hash).toMatch(/^[0-9a-f]{64}$/);
			});

			it('알려진 해시 값과 일치해야 한다', () => {
				/**
				 * 'hello'의 SHA-256 해시는 알려진 값
				 * 이 테스트는 crypto 구현이 표준을 따르는지 확인
				 */
				const input = 'hello';
				const expectedHash =
					'2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824';

				const hash = createSHA256Hash(input);

				expect(hash).toBe(expectedHash);
			});
		});

		describe('특수 입력 처리', () => {
			it('빈 문자열도 해시할 수 있어야 한다', () => {
				const input = '';
				// 빈 문자열의 SHA-256 해시 (알려진 값)
				const expectedHash =
					'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

				const hash = createSHA256Hash(input);

				expect(hash).toBe(expectedHash);
				expect(hash).toHaveLength(64);
			});

			it('한글 문자열을 해시할 수 있어야 한다', () => {
				const input = '안녕하세요 모동숲 마켓입니다';

				const hash = createSHA256Hash(input);

				expect(hash).toHaveLength(64);
				expect(hash).toMatch(/^[0-9a-f]{64}$/);

				// 동일한 한글 입력에 대해 일관된 해시
				const hash2 = createSHA256Hash(input);
				expect(hash).toBe(hash2);
			});

			it('이모지를 포함한 문자열을 해시할 수 있어야 한다', () => {
				const input = '🦊 여우 아이템 교환해요! 🌟';

				const hash = createSHA256Hash(input);

				expect(hash).toHaveLength(64);
				expect(hash).toMatch(/^[0-9a-f]{64}$/);
			});

			it('특수문자를 포함한 문자열을 해시할 수 있어야 한다', () => {
				const input = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~';

				const hash = createSHA256Hash(input);

				expect(hash).toHaveLength(64);
				expect(hash).toMatch(/^[0-9a-f]{64}$/);
			});

			it('공백만 있는 문자열도 해시할 수 있어야 한다', () => {
				const input = '   ';

				const hash = createSHA256Hash(input);

				expect(hash).toHaveLength(64);
				expect(hash).toMatch(/^[0-9a-f]{64}$/);

				// 빈 문자열과 다른 해시여야 함
				const emptyHash = createSHA256Hash('');
				expect(hash).not.toBe(emptyHash);
			});

			it('줄바꿈을 포함한 문자열을 해시할 수 있어야 한다', () => {
				const input = 'line1\nline2\r\nline3';

				const hash = createSHA256Hash(input);

				expect(hash).toHaveLength(64);
				expect(hash).toMatch(/^[0-9a-f]{64}$/);
			});

			it('매우 긴 문자열도 해시할 수 있어야 한다', () => {
				// 10,000자 문자열
				const input = 'a'.repeat(10000);

				const hash = createSHA256Hash(input);

				expect(hash).toHaveLength(64);
				expect(hash).toMatch(/^[0-9a-f]{64}$/);
			});
		});

		describe('일관성 검증', () => {
			it('대소문자가 다른 문자열은 다른 해시를 반환해야 한다', () => {
				const lower = 'hello';
				const upper = 'HELLO';

				const hashLower = createSHA256Hash(lower);
				const hashUpper = createSHA256Hash(upper);

				expect(hashLower).not.toBe(hashUpper);
			});

			it('앞뒤 공백이 있는 문자열은 다른 해시를 반환해야 한다', () => {
				const noSpace = 'hello';
				const withSpace = ' hello ';

				const hashNoSpace = createSHA256Hash(noSpace);
				const hashWithSpace = createSHA256Hash(withSpace);

				expect(hashNoSpace).not.toBe(hashWithSpace);
			});

			it('숫자 문자열도 해시할 수 있어야 한다', () => {
				const input = '1234567890';

				const hash = createSHA256Hash(input);

				expect(hash).toHaveLength(64);
				expect(hash).toMatch(/^[0-9a-f]{64}$/);
			});
		});

		describe('실제 사용 시나리오', () => {
			it('사용자 ID 해싱 시나리오', () => {
				/**
				 * 실제 앱에서 Apple 로그인 시 provider ID를 해싱하여
				 * 안전한 형태로 저장하는 시나리오
				 */
				const appleProviderId = '001234.56789abcdef.fedcba98765';

				const hash = createSHA256Hash(appleProviderId);

				expect(hash).toHaveLength(64);
				expect(hash).toMatch(/^[0-9a-f]{64}$/);

				// 동일한 provider ID는 항상 동일한 해시
				const hash2 = createSHA256Hash(appleProviderId);
				expect(hash).toBe(hash2);
			});

			it('이메일 해싱 시나리오', () => {
				/**
				 * 이메일 주소를 해싱하여 익명화된 식별자로 사용
				 */
				const email = 'user@example.com';

				const hash = createSHA256Hash(email);

				expect(hash).toHaveLength(64);
				expect(hash).toMatch(/^[0-9a-f]{64}$/);
			});

			it('복합 데이터 해싱 시나리오', () => {
				/**
				 * 여러 데이터를 결합하여 고유 식별자 생성
				 */
				const userId = 'user123';
				const postId = 'post456';
				const timestamp = '2024-01-15T12:00:00Z';

				const combinedData = `${userId}:${postId}:${timestamp}`;
				const hash = createSHA256Hash(combinedData);

				expect(hash).toHaveLength(64);
				expect(hash).toMatch(/^[0-9a-f]{64}$/);

				// 다른 조합은 다른 해시
				const differentCombined = `${userId}:${postId}:2024-01-15T13:00:00Z`;
				const differentHash = createSHA256Hash(differentCombined);

				expect(hash).not.toBe(differentHash);
			});
		});
	});
});
