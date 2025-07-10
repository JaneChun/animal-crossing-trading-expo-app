import * as functions from 'firebase-functions';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { createSHA256Hash } from '../utils/crypto';

// Apple의 공개키 모음(JSON Web Key Set)을 가져오는 클라이언트
const appleClient = jwksClient({
	jwksUri: 'https://appleid.apple.com/auth/keys',
});

/**
 * JWT의 key ID를 입력받아, 해당 kid에 해당하는 PEM 형식 공개 키 문자열 반환
 * @param kid - Key ID from JWT header
 * @returns Promise<string> - PEM formatted public key
 */
function getAppleSigningKey(kid: string): Promise<string> {
	return new Promise((resolve, reject) => {
		appleClient.getSigningKey(kid, (err, key) => {
			if (err) return reject(err);
			resolve(key!.getPublicKey());
		});
	});
}

/**
 * Apple에서 준 ID 토큰을 검증하고 페이로드를 반환
 * @param idToken - Apple ID Token
 * @param rawNonce - Original nonce used for token request
 * @returns Promise<any> - Verified token payload
 */
export async function verifyAppleIdToken(
	idToken: string,
	rawNonce: string,
): Promise<any> {
	// 1. JWT 헤더 디코딩 -> kid 추출
	const decodedHeader: any = jwt.decode(idToken, { complete: true })?.header;
	if (!decodedHeader?.kid) {
		throw new functions.https.HttpsError(
			'invalid-argument',
			'유효하지 않은 Apple ID 토큰입니다. (kid 누락)',
		);
	}

	// 2. JWKS에서 공개키 가져와 서명 검증
	const publicKey = await getAppleSigningKey(decodedHeader.kid);
	const payload: any = jwt.verify(idToken, publicKey, {
		algorithms: ['RS256'],
		audience: 'com.janechun.animalcrossingtradingapp',
		issuer: 'https://appleid.apple.com',
	});

	// 3. payload.nonce 와 rawNonce 해시값 비교
	const expectedNonce = createSHA256Hash(rawNonce);
	if (payload.nonce !== expectedNonce) {
		throw new functions.https.HttpsError(
			'invalid-argument',
			'유효하지 않은 nonce 값입니다.',
		);
	}

	return payload; // { sub, email, email_verified, ... }
}

/**
 * Apple 로그인 처리
 * @param idToken - Apple ID Token
 * @param rawNonce - Original nonce
 * @returns Promise<{providerId: string, email: string}>
 */
export async function handleAppleLogin(
	idToken: string,
	rawNonce: string,
): Promise<{ providerId: string; email: string }> {
	if (!idToken || !rawNonce) {
		throw new functions.https.HttpsError(
			'invalid-argument',
			'idToken과 rawNonce가 누락되었습니다.',
		);
	}

	try {
		const payload = await verifyAppleIdToken(idToken, rawNonce);
		return {
			providerId: String(payload.sub),
			email: payload.email,
		};
	} catch (error) {
		console.error('Apple API error:', error);

		// 이미 HttpsError로 던져진 경우 그대로 재던짐
		if (error instanceof functions.https.HttpsError) {
			throw error;
		}

		// 그 외 예외만 internal로 감싸기
		throw new functions.https.HttpsError(
			'internal',
			'Apple 사용자 정보 조회 실패',
		);
	}
}
