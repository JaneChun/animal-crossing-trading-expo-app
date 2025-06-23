import { auth, functions } from '@/fbase';
import { GetFirebaseCustomTokenResponse, OauthType } from '@/types/user';
import { login } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import { signInWithCustomToken, User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { saveUserInfo } from './userService';

export const loginWithKakao = async (): Promise<{
	user: User;
	email: string;
} | null> => {
	const kakaoTokenInfo = await login();

	const {
		firebaseToken,
		user: { email, nickname },
	} = await getFirebaseCustomToken({
		oauthType: 'kakao',
		accessToken: kakaoTokenInfo!.accessToken,
	});

	const result = await signInWithCustomToken(auth, firebaseToken);
	if (!result.user) return null;

	return { user: result.user, email };
};

export const loginWithNaver = async (): Promise<{
	user: User;
	email: string;
} | null> => {
	const { successResponse } = await NaverLogin.login();

	// 사용자가 로그인 도중 취소한 경우
	if (!successResponse || !successResponse.accessToken) {
		const error = new Error('네이버 로그인 취소');
		(error as any).code = 'Cancelled';
		throw error;
	}

	const {
		firebaseToken,
		user: { email, nickname },
	} = await getFirebaseCustomToken({
		oauthType: 'naver',
		accessToken: successResponse!.accessToken,
	});

	const result = await signInWithCustomToken(auth, firebaseToken);
	if (!result.user) return null;

	return { user: result.user, email };
};

export const updateLastLogin = async (uid: string) => {
	await saveUserInfo({
		uid,
		lastLogin: Timestamp.now(),
	});
};

export const getFirebaseCustomToken = async ({
	oauthType,
	accessToken,
}: {
	oauthType: OauthType;
	accessToken: string;
}): Promise<GetFirebaseCustomTokenResponse> => {
	try {
		const getCustomToken = httpsCallable(functions, 'getFirebaseCustomToken');
		const { data } = await getCustomToken({ oauthType, accessToken });

		return data as GetFirebaseCustomTokenResponse;
	} catch (e) {
		console.error('Error getting Firebase custom token:', e);
		throw e;
	}
};
