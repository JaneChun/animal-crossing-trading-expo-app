import * as functions from 'firebase-functions';
import { defineString } from 'firebase-functions/params';
import { OAuth2Client } from 'google-auth-library';

// Google Cloud의 웹 클라이언트 ID — 앱의 GoogleSignin.configure({ webClientId })와 같은 값
const googleWebClientId = defineString('GOOGLE_WEB_CLIENT_ID');

const googleClient = new OAuth2Client();

/**
 * Google 로그인 처리
 * @param idToken - Google ID Token
 * @returns Promise<{providerId: string, email: string}>
 */
export async function handleGoogleLogin(
	idToken: string,
): Promise<{ providerId: string; email: string }> {
	if (!idToken) {
		throw new functions.https.HttpsError(
			'invalid-argument',
			'idToken이 누락되었습니다.',
		);
	}

	let payload;
	try {
		// 서명·만료·발급자·audience 검증
		const ticket = await googleClient.verifyIdToken({
			idToken,
			audience: googleWebClientId.value(),
		});
		payload = ticket.getPayload();
	} catch (error) {
		console.error('Google ID 토큰 검증 실패:', error);
		throw new functions.https.HttpsError(
			'unauthenticated',
			'유효하지 않은 Google ID 토큰입니다.',
		);
	}

	if (!payload?.sub) {
		throw new functions.https.HttpsError(
			'internal',
			'Google 사용자 정보 조회 실패',
		);
	}

	return {
		providerId: payload.sub,
		email: payload.email ?? '',
	};
}
