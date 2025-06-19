import {
	DEFAULT_USER_REPORT,
	DEFAULT_USER_REVIEW,
} from '@/constants/defaultUserInfo';
import { auth } from '@/fbase';
import { OauthType, UserInfo } from '@/types/user';
import { login } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import axios from 'axios';
import {
	OAuthProvider,
	signInWithCredential,
	signInWithCustomToken,
	User,
} from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { getUserInfo, saveUserInfo } from './userService';

export const loginWithKakao = async (): Promise<User | null> => {
	const kakaoTokenInfo = await login();
	const provider = new OAuthProvider('oidc.kakao');
	const credential = provider.credential({
		idToken: kakaoTokenInfo.idToken,
	});

	const result = await signInWithCredential(auth, credential);
	return result.user;
};

export const loginWithNaver = async (): Promise<User | null> => {
	const { failureResponse, successResponse } = await NaverLogin.login();
	const firebaseCustomToken = await getFirebaseCustomToken(
		successResponse!.accessToken,
	);

	const result = await signInWithCustomToken(auth, firebaseCustomToken);
	return result.user;
};

// Firestore에 유저가 없으면 생성, 있으면 반환
export const ensureUserExists = async (
	user: User,
	oauthType: OauthType,
): Promise<UserInfo> => {
	let userInfo = await getUserInfo(user.uid);

	if (!userInfo) {
		const newUser: UserInfo = {
			uid: user.uid,
			displayName: user.displayName ?? '',
			islandName: '',
			photoURL: user.photoURL ?? '',
			review: DEFAULT_USER_REVIEW,
			report: DEFAULT_USER_REPORT,
			oauthType,
			createdAt: Timestamp.now(),
			lastLogin: Timestamp.now(),
		};
		await saveUserInfo(newUser);
		userInfo = newUser;
	}

	return userInfo;
};

export const updateLastLogin = async (uid: string) => {
	await saveUserInfo({
		uid,
		lastLogin: Timestamp.now(),
	});
};

export const getFirebaseCustomToken = async (accessToken: string) => {
	try {
		const response = await axios.post(
			process.env.EXPO_PUBLIC_GET_CUSTOM_TOKEN_URL || '',
			{ accessToken },
			{ headers: { 'Content-Type': 'application/json' } },
		);

		return response.data.firebaseToken;
	} catch (error) {
		console.error('Error getting Firebase custom token:', error);
		throw error;
	}
};
