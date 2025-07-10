import axios from 'axios';
import * as functions from 'firebase-functions';

interface NaverUserInfo {
	resultcode: string;
	message: string;
	response: {
		id: string;
		email: string;
	};
}

/**
 * Naver 사용자 정보 조회
 * @param accessToken - Naver access token
 * @returns Promise<{providerId: string, email: string}>
 */
export async function handleNaverLogin(
	accessToken: string,
): Promise<{ providerId: string; email: string }> {
	if (!accessToken) {
		throw new functions.https.HttpsError(
			'invalid-argument',
			'accessToken이 누락되었습니다.',
		);
	}

	try {
		const { data } = await axios.get<NaverUserInfo>(
			'https://openapi.naver.com/v1/nid/me',
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
		);

		if (data.resultcode !== '00') {
			throw new functions.https.HttpsError(
				'unauthenticated',
				'accessToken이 유효하지 않거나 만료되었습니다.',
			);
		}

		return {
			providerId: String(data.response.id),
			email: data.response.email,
		};
	} catch (error) {
		console.error('Naver API error:', error);

		// 이미 HttpsError로 던져진 경우 그대로 재던짐
		if (error instanceof functions.https.HttpsError) {
			throw error;
		}

		// 그 외 예외만 internal로 감싸기
		throw new functions.https.HttpsError(
			'internal',
			'Naver 사용자 정보 조회 실패',
		);
	}
}
