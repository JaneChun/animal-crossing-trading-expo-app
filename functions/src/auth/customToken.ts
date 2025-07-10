import * as functions from 'firebase-functions';
import { auth } from '../utils/common';
import { isUserRestrictedFromRejoining } from '../utils/common';
import { handleAppleLogin } from './apple';
import { handleKakaoLogin } from './kakao';
import { handleNaverLogin } from './naver';

export interface CustomTokenRequest {
  oauthType: string;
  accessToken?: string; // 네이버, 카카오
  idToken?: string; // Apple
  rawNonce?: string; // Apple
}

export interface CustomTokenResponse {
  firebaseToken: string;
  user: {
    email: string;
  };
}

/**
 * Firebase Custom Token 생성을 위한 메인 함수
 * @param request - 인증 요청 데이터
 * @returns Promise<CustomTokenResponse>
 */
export async function createFirebaseCustomToken(
  request: CustomTokenRequest
): Promise<CustomTokenResponse> {
  const { oauthType, accessToken, idToken, rawNonce } = request;

  if (!oauthType) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'oauthType가 누락되었습니다.'
    );
  }

  try {
    let providerId: string;
    let email: string;

    // OAuth 타입에 따라 사용자 정보 조회
    switch (oauthType) {
      case 'kakao':
        ({ providerId, email } = await handleKakaoLogin(accessToken!));
        break;
      case 'naver':
        ({ providerId, email } = await handleNaverLogin(accessToken!));
        break;
      case 'apple':
        ({ providerId, email } = await handleAppleLogin(idToken!, rawNonce!));
        break;
      default:
        throw new functions.https.HttpsError(
          'invalid-argument',
          '지원하지 않는 oauthType입니다.'
        );
    }

    // 30일 이내 재가입 제한 확인
    if (await isUserRestrictedFromRejoining(providerId)) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        '30일 이내 재가입이 제한된 계정입니다.'
      );
    }

    // Firebase Custom Token 생성
    const customToken = await auth.createCustomToken(providerId);

    return {
      firebaseToken: customToken,
      user: { email },
    };
  } catch (error: any) {
    console.error('Firebase Custom Token 생성 실패:', error);

    // 이미 HttpsError로 던져진 경우 그대로 재던짐
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    // 그 외 예외만 internal로 감싸기
    throw new functions.https.HttpsError(
      'internal',
      'Firebase Custom Token 생성 중 오류가 발생했습니다.',
      error.message
    );
  }
}