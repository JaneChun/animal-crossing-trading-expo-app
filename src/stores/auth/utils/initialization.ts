import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { initializeKakaoSDK as initKakaoSDK } from '@react-native-kakao/core';
import NaverLogin from '@react-native-seoul/naver-login';

export const initializeKakaoSDK = (): void => {
	const kakaoKey = process.env.EXPO_PUBLIC_KAKAO_IOS_KEY;
	if (kakaoKey) {
		initKakaoSDK(kakaoKey);
	} else {
		console.warn('Kakao iOS Key가 설정되지 않았습니다.');
	}
};

export const initializeNaverSDK = (): void => {
	const naverConfig = {
		appName: '모동숲 마켓',
		consumerKey: process.env.EXPO_PUBLIC_NAVER_CLIENT_ID || '',
		consumerSecret: process.env.EXPO_PUBLIC_NAVER_SECRET || '',
		serviceUrlSchemeIOS: process.env.EXPO_PUBLIC_NAVER_SERVICE_URL_SCHEME,
		disableNaverAppAuthIOS: true, // (iOS) 네이버앱을 사용하는 인증을 비활성화 한다. (default: false)
	};

	if (!naverConfig.consumerKey || !naverConfig.consumerSecret) {
		console.warn('Naver 설정이 완전하지 않습니다.');
		return;
	}

	NaverLogin.initialize(naverConfig);
};

export const initializeGoogleSDK = (): void => {
	const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

	if (!webClientId) {
		console.warn('Google 웹 클라이언트 ID가 설정되지 않았습니다.');
		return;
	}

	GoogleSignin.configure({ webClientId });
};

export const initializeAllSDKs = (): void => {
	initializeKakaoSDK();
	initializeNaverSDK();
	initializeGoogleSDK();
};
