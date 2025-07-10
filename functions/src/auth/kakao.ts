import axios from 'axios';
import * as functions from 'firebase-functions';

interface KakaoUserInfo {
  id: number;
  kakao_account: {
    email: string;
  };
}

/**
 * Kakao 사용자 정보 조회
 * @param accessToken - Kakao access token
 * @returns Promise<{providerId: string, email: string}>
 */
export async function handleKakaoLogin(
  accessToken: string
): Promise<{ providerId: string; email: string }> {
  if (!accessToken) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'accessToken이 누락되었습니다.'
    );
  }

  try {
    const { data } = await axios.get<KakaoUserInfo>(
      'https://kapi.kakao.com/v2/user/me',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return {
      providerId: String(data.id),
      email: data.kakao_account.email,
    };
  } catch (error) {
    console.error('Kakao API error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Kakao 사용자 정보 조회 실패'
    );
  }
}