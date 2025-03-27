import {
	getUserInfo,
	moveToDeletedUsers,
	saveUserInfo,
} from '@/firebase/services/userService';
import { UserInfo } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import { login, logout } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import axios from 'axios';
import {
	deleteUser,
	OAuthProvider,
	onAuthStateChanged,
	reauthenticateWithCredential,
	signInWithCredential,
	signInWithCustomToken,
} from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { auth } from '../fbase';
import firebaseRequest from '../firebase/core/firebaseInterceptor';

type AuthState = {
	userInfo: UserInfo | null;
	setUserInfo: (user: UserInfo | null) => void;
	kakaoLogin: () => Promise<boolean>;
	kakaoLogout: () => Promise<boolean>;
	kakaoDeleteAccount: (uid: string) => Promise<boolean>;
	naverLogin: () => Promise<boolean>;
	naverLogout: () => Promise<boolean>;
	naverDeleteAccount: (uid: string) => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set) => ({
	userInfo: null,
	setUserInfo: (user) => set({ userInfo: user }),
	kakaoLogin: async () => {
		return firebaseRequest('로그인', async () => {
			const kakaoTokenInfo = await login();
			const provider = new OAuthProvider('oidc.kakao');

			const credential = provider.credential({
				idToken: kakaoTokenInfo.idToken,
			});

			const result = await signInWithCredential(auth, credential);
			const { user } = result;

			// Firestore에서 유저 정보 가져오기
			let fetchedUserInfo = await getUserInfo(user.uid);

			// Firestore에 없으면 새로 저장
			if (!fetchedUserInfo) {
				await saveUserInfo({
					uid: user.uid,
					displayName: user.displayName ?? '',
					photoURL: user.photoURL ?? '',
					oauthType: 'kakao',
					lastLogin: Timestamp.now(),
				});

				fetchedUserInfo = await getUserInfo(user.uid);
			} else {
				await saveUserInfo({
					...fetchedUserInfo,
					lastLogin: Timestamp.now(),
				});
			}

			// 로컬 상태 업데이트
			set({ userInfo: fetchedUserInfo });
			await AsyncStorage.setItem('@user', JSON.stringify(fetchedUserInfo));

			return true;
		});
	},
	kakaoLogout: async () => {
		return firebaseRequest('로그아웃', async () => {
			await logout(); // 카카오 로그아웃
			await auth.signOut(); // Firebase auth 로그아웃

			// 로컬 상태 초기화
			set({ userInfo: null });
			await AsyncStorage.removeItem('@user');

			return true;
		});
	},
	kakaoDeleteAccount: async (uid) => {
		return firebaseRequest('회원 탈퇴', async () => {
			const user = auth.currentUser;
			if (!user || !useAuthStore.getState().userInfo) return false;

			// 재인증 후 탈퇴 가능
			const kakaoTokenInfo = await login();
			const provider = new OAuthProvider('oidc.kakao');

			const credential = provider.credential({
				idToken: kakaoTokenInfo.idToken,
			});

			await reauthenticateWithCredential(user, credential);

			// 탈퇴한 유저 데이터를 DeletedUsers 컬렉션으로 이동
			const userInfo = useAuthStore.getState().userInfo;
			if (!userInfo) return false;
			await moveToDeletedUsers(userInfo);

			// Firebase Authentication에서 유저 삭제
			await deleteUser(user);

			// 네이버 로그인 토큰 삭제
			await NaverLogin.deleteToken();

			// 로컬 상태 초기화
			set({ userInfo: null });
			await AsyncStorage.removeItem('@user');

			return true;
		});
	},
	naverLogin: async () => {
		return firebaseRequest('로그인', async () => {
			const { failureResponse, successResponse } = await NaverLogin.login();

			if (failureResponse) return false;

			const firebaseCustomToken = await getFirebaseCustomToken(
				successResponse!.accessToken,
			);

			const result = await signInWithCustomToken(auth, firebaseCustomToken);
			const { user } = result;

			// Firestore에서 유저 정보 가져오기
			let fetchedUserInfo = await getUserInfo(user.uid);

			// Firestore에 없으면 새로 저장
			if (!fetchedUserInfo) {
				const profileResult = await NaverLogin.getProfile(
					successResponse!.accessToken,
				);

				await saveUserInfo({
					uid: user.uid,
					displayName: profileResult.response.nickname ?? '',
					photoURL: profileResult.response.profile_image ?? '',
					oauthType: 'naver',
					lastLogin: Timestamp.now(),
				});

				fetchedUserInfo = await getUserInfo(user.uid);
			} else {
				await saveUserInfo({
					...fetchedUserInfo,
					lastLogin: Timestamp.now(),
				});
			}

			// 로컬 상태 업데이트
			set({ userInfo: fetchedUserInfo });
			await AsyncStorage.setItem('@user', JSON.stringify(fetchedUserInfo));

			return true;
		});
	},
	naverLogout: async () => {
		return firebaseRequest('로그아웃', async () => {
			await NaverLogin.logout(); // 네이버 로그아웃
			await auth.signOut(); // Firebase auth 로그아웃

			// 로컬 상태 초기화
			set({ userInfo: null });
			await AsyncStorage.removeItem('@user');

			return true;
		});
	},
	naverDeleteAccount: async (uid) => {
		return firebaseRequest('회원 탈퇴', async () => {
			const user = auth.currentUser;
			if (!user || !useAuthStore.getState().userInfo) return false;

			// 재인증 후 탈퇴 가능
			const { failureResponse, successResponse } = await NaverLogin.login();

			if (failureResponse) return false;

			const firebaseCustomToken = await getFirebaseCustomToken(
				successResponse!.accessToken,
			);

			await signInWithCustomToken(auth, firebaseCustomToken);

			// 탈퇴한 유저 데이터를 DeletedUsers 컬렉션으로 이동
			const userInfo = useAuthStore.getState().userInfo;
			if (!userInfo) return false;
			await moveToDeletedUsers(userInfo);

			// Firebase Authentication에서 유저 삭제
			await deleteUser(user);

			// 네이버 로그인 토큰 삭제
			await NaverLogin.deleteToken();

			// 로컬 상태 초기화
			set({ userInfo: null });
			await AsyncStorage.removeItem('@user');

			return true;
		});
	},
}));

export const useAuthInitializer = () => {
	const setUserInfo = useAuthStore((state) => state.setUserInfo);

	// 앱이 실행될 때 Kakao, Naver SDK 초기화
	useEffect(() => {
		if (process.env.EXPO_PUBLIC_KAKAO_IOS_KEY) {
			initializeKakaoSDK(process.env.EXPO_PUBLIC_KAKAO_IOS_KEY);
		}

		NaverLogin.initialize({
			appName: '모동숲 마켓',
			consumerKey: process.env.EXPO_PUBLIC_NAVER_CLIENT_ID || '',
			consumerSecret: process.env.EXPO_PUBLIC_NAVER_SECRET || '',
			serviceUrlSchemeIOS: process.env.EXPO_PUBLIC_NAVER_SERVICE_URL_SCHEME,
			disableNaverAppAuthIOS: true,
		});
	}, []);

	// Firebase Auth 상태 변화 감지하여 userInfo 저장
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				const fetchedUserInfo = await getUserInfo(user.uid);

				if (!fetchedUserInfo) {
					Alert.alert(
						'계정 정보 없음',
						'유저 정보를 불러올 수 없습니다. 다시 로그인해 주세요.',
						[{ text: '확인', onPress: () => auth.signOut() }],
					);

					setUserInfo(null);
					await AsyncStorage.removeItem('@user');
					return;
				}

				setUserInfo(fetchedUserInfo);
				await AsyncStorage.setItem('@user', JSON.stringify(fetchedUserInfo));
			} else {
				setUserInfo(null);
				await AsyncStorage.removeItem('@user');
			}
		});
		return () => unsubscribe();
	}, [setUserInfo]);

	// 로컬 저장소(AsyncStorage)와 상태를 동기화
	useEffect(() => {
		const loadUser = async () => {
			const storedUser = await AsyncStorage.getItem('@user');
			if (storedUser) {
				setUserInfo(JSON.parse(storedUser));
			}
		};

		loadUser();
	}, [setUserInfo]);
};

const getFirebaseCustomToken = async (accessToken: string) => {
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
