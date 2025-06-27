import { auth, functions } from '@/fbase';
import {
	GetFirebaseCustomTokenParams,
	GetFirebaseCustomTokenResponse,
} from '@/types/user';
import { login } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { signInWithCustomToken, User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { saveUserInfo } from './userService';

export const loginWithKakao = async (): Promise<{
	user: User;
	email: string;
} | null> => {
	const kakaoTokenInfo = await login();

	const credential = await getFirebaseCustomToken({
		oauthType: 'kakao',
		accessToken: kakaoTokenInfo!.accessToken,
	}).catch((e) => {
		if (e.code === 'Cancelled') return null;
		throw e;
	});
	const { firebaseToken, user } = credential ?? {};
	if (!firebaseToken) return null;

	const result = await signInWithCustomToken(auth, firebaseToken);
	if (!result.user) return null;

	return { user: result.user, email: user!.email };
};

export const loginWithNaver = async (): Promise<{
	user: User;
	email: string;
} | null> => {
	const { successResponse } = await NaverLogin.login();

	if (!successResponse || !successResponse.accessToken) {
		return null;
	}

	const {
		firebaseToken,
		user: { email },
	} = await getFirebaseCustomToken({
		oauthType: 'naver',
		accessToken: successResponse!.accessToken,
	});

	const result = await signInWithCustomToken(auth, firebaseToken);
	if (!result.user) return null;

	return { user: result.user, email };
};

export const loginWithApple = async (): Promise<{
	user: User;
	email: string;
} | null> => {
	// rawNonce 생성 → SHA256 해시
	const rawNonce = Crypto.randomUUID();
	const hashedNonce = await Crypto.digestStringAsync(
		Crypto.CryptoDigestAlgorithm.SHA256,
		rawNonce,
	);

	// Apple 로그인 팝업 (해시된 nonce 전달)
	const credential = await AppleAuthentication.signInAsync({
		requestedScopes: [
			AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
			AppleAuthentication.AppleAuthenticationScope.EMAIL,
		],
		nonce: hashedNonce,
	}).catch((e) => {
		if (e.code === 'ERR_REQUEST_CANCELED') return null;
		throw e;
	});
	const { identityToken } = credential ?? {};
	if (!identityToken) return null;

	const {
		firebaseToken,
		user: { email },
	} = await getFirebaseCustomToken({
		oauthType: 'apple',
		idToken: identityToken,
		rawNonce,
	});

	const result = await signInWithCustomToken(auth, firebaseToken);

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
	idToken,
	rawNonce,
}: GetFirebaseCustomTokenParams): Promise<GetFirebaseCustomTokenResponse> => {
	const getCustomToken = httpsCallable(functions, 'getFirebaseCustomToken');
	const { data } = await getCustomToken({
		oauthType,
		accessToken,
		idToken,
		rawNonce,
	});

	return data as GetFirebaseCustomTokenResponse;
};
