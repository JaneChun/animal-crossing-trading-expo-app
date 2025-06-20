import { auth } from '@/fbase';
import { OauthType } from '@/types/user';
import { login } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import axios from 'axios';
import { signInWithCustomToken, User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
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
}) => {
	try {
		const response = await axios.post(
			process.env.EXPO_PUBLIC_GET_CUSTOM_TOKEN_URL || '',
			{ oauthType, accessToken },
			{ headers: { 'Content-Type': 'application/json' } },
		);

		return response.data;
	} catch (error) {
		console.error('Error getting Firebase custom token:', error);
		throw error;
	}
};
