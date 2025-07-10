import * as crypto from 'crypto';

/**
 * 입력 문자열의 SHA-256 해시 생성
 * @param input - 해시할 문자열
 * @returns 해시의 16진수 문자열 표현
 */
export function createSHA256Hash(input: string): string {
	return crypto.createHash('sha256').update(input).digest('hex');
}

