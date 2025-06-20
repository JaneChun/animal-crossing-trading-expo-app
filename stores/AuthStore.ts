import {
	loginWithKakao,
	loginWithNaver,
	updateLastLogin,
} from '@/firebase/services/authService';
import {
	getUserInfo,
	moveToDeletedUsers,
	savePushTokenToFirestore,
} from '@/firebase/services/userService';
import { UserInfo } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import { isLogined, logout } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import { deleteUser, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { create } from 'zustand';
import { auth } from '../fbase';
import firebaseRequest from '../firebase/core/firebaseInterceptor';
import { usePushNotificationStore } from './PushNotificationStore';

export type LoginResult = {
	isSuccess: boolean;
	isNewUser: boolean;
	email: string;
};

type AuthState = {
	userInfo: UserInfo | null;
	setUserInfo: (user: UserInfo | null) => void;
	isAuthLoading: boolean;
	setIsAuthLoading: (loading: boolean) => void;
	kakaoLogin: () => Promise<LoginResult>;
	kakaoLogout: () => Promise<boolean>;
	kakaoDeleteAccount: (uid: string) => Promise<boolean>;
	naverLogin: () => Promise<LoginResult>;
	naverLogout: () => Promise<boolean>;
	naverDeleteAccount: (uid: string) => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set) => ({
	userInfo: null,
	setUserInfo: (user) => {
		console.log(`\x1b[33m${'setUserInfo :' + JSON.stringify(user)}\x1b[0m`);
		set({ userInfo: user });
	},
	isAuthLoading: false,
	setIsAuthLoading: (loading) => set({ isAuthLoading: loading }),
	kakaoLogin: async () => {
		const setUserInfo = useAuthStore.getState().setUserInfo;
		const setIsAuthLoading = useAuthStore.getState().setIsAuthLoading;

		setIsAuthLoading(true);

		let isNewUser = false;
		let userEmail = '';

		const isSuccess = await firebaseRequest('로그인', async () => {
			const loginResult = await loginWithKakao();
			if (!loginResult) return false;

			const { user, email } = loginResult;
			userEmail = email;

			const userInfo = await getUserInfo(user.uid);

			// 신규 유저
			if (!userInfo) {
				isNewUser = true;
				return true;
			}

			// 기존 유저
			await updateLastLogin(userInfo.uid);

			// 로컬 상태 업데이트
			setUserInfo(userInfo);
			await AsyncStorage.setItem('@user', JSON.stringify(userInfo));

			return true;
		}).catch(() => false);

		setIsAuthLoading(false);
		return { isSuccess, isNewUser, email: userEmail };
	},
	kakaoLogout: async () => {
		const setIsAuthLoading = useAuthStore.getState().setIsAuthLoading;

		if (!isLogined() || !auth.currentUser) return;

		setIsAuthLoading(true);

		const isSuccess = await firebaseRequest('로그아웃', async () => {
			await logout(); // 카카오 로그아웃
			await auth.signOut(); // Firebase auth 로그아웃

			// 로컬 상태 초기화
			set({ userInfo: null });
			await AsyncStorage.removeItem('@user');

			return true;
		}).catch(() => false);

		setIsAuthLoading(false);
		return isSuccess;
	},
	kakaoDeleteAccount: async (uid) => {
		const userInfo = useAuthStore.getState().userInfo;
		const setUserInfo = useAuthStore.getState().setUserInfo;

		const setIsAuthLoading = useAuthStore.getState().setIsAuthLoading;
		setIsAuthLoading(true);

		const isSuccess = await firebaseRequest('회원 탈퇴', async () => {
			const user = auth.currentUser;
			if (!user || !userInfo) return false;

			// 재인증 후 탈퇴 가능
			await loginWithKakao();

			// DeletedUsers 컬렉션으로 이동
			await moveToDeletedUsers(userInfo);

			// Firebase Authentication에서 유저 삭제
			await deleteUser(user);

			// 로컬 상태 초기화
			setUserInfo(null);
			await AsyncStorage.removeItem('@user');

			return true;
		}).catch(() => false);

		setIsAuthLoading(false);
		return isSuccess;
	},
	naverLogin: async () => {
		const setUserInfo = useAuthStore.getState().setUserInfo;
		const setIsAuthLoading = useAuthStore.getState().setIsAuthLoading;

		setIsAuthLoading(true);

		let isNewUser = false;
		let userEmail = '';

		const isSuccess = await firebaseRequest('로그인', async () => {
			const loginResult = await loginWithNaver();
			if (!loginResult) return false;

			const { user, email } = loginResult;
			userEmail = email;

			const userInfo = await getUserInfo(user.uid);

			// 신규 유저
			if (!userInfo) {
				isNewUser = true;
				return true;
			}

			// 기존 유저
			await updateLastLogin(userInfo.uid);

			// 로컬 상태 업데이트
			setUserInfo(userInfo);
			await AsyncStorage.setItem('@user', JSON.stringify(userInfo));

			return true;
		}).catch(() => false);

		setIsAuthLoading(false);
		return { isSuccess, isNewUser, email: userEmail };
	},
	naverLogout: async () => {
		const setIsAuthLoading = useAuthStore.getState().setIsAuthLoading;

		if (!auth.currentUser) return;

		setIsAuthLoading(true);

		const isSuccess = await firebaseRequest('로그아웃', async () => {
			await NaverLogin.logout(); // 네이버 로그아웃
			await auth.signOut(); // Firebase auth 로그아웃

			// 로컬 상태 초기화
			set({ userInfo: null });
			await AsyncStorage.removeItem('@user');

			return true;
		}).catch(() => false);

		setIsAuthLoading(false);
		return isSuccess;
	},
	naverDeleteAccount: async (uid) => {
		const userInfo = useAuthStore.getState().userInfo;
		const setUserInfo = useAuthStore.getState().setUserInfo;

		const setIsAuthLoading = useAuthStore.getState().setIsAuthLoading;
		setIsAuthLoading(true);

		const isSuccess = await firebaseRequest('회원 탈퇴', async () => {
			const user = auth.currentUser;
			if (!user || !userInfo) return false;

			// 재인증 후 탈퇴 가능
			await loginWithNaver();

			// DeletedUsers 컬렉션으로 이동
			await moveToDeletedUsers(userInfo);

			// Firebase Authentication에서 유저 삭제
			await deleteUser(user);

			// 네이버 로그인 토큰 삭제
			await NaverLogin.deleteToken();

			// 로컬 상태 초기화
			setUserInfo(null);
			await AsyncStorage.removeItem('@user');

			return true;
		}).catch(() => false);

		setIsAuthLoading(false);
		return isSuccess;
	},
}));

export const useAuthInitializer = () => {
	const userInfo = useAuthStore.getState().userInfo;
	const setUserInfo = useAuthStore.getState().setUserInfo;
	const expoPushToken = usePushNotificationStore.getState().expoPushToken;

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

	// Firebase Auth 로그인 상태가 변경될 때마다 실행됨
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			// 로그아웃 상태 → 상태 및 저장소 초기화
			if (!user) {
				setUserInfo(null);
				await AsyncStorage.removeItem('@user');
				return;
			}

			const fetchedUserInfo = await getUserInfo(user.uid);

			// 로그인 상태 & Firestore에 유저 정보가 없는 경우  → 상태 및 저장소 초기화
			if (!fetchedUserInfo) {
				setUserInfo(null);
				await AsyncStorage.removeItem('@user');
				return;
			}

			// 로그인 상태 & 정상적인 유저 정보 → 상태와 저장소에 동기화
			setUserInfo(fetchedUserInfo);
			await AsyncStorage.setItem('@user', JSON.stringify(fetchedUserInfo));
		});
		return () => unsubscribe();
	}, [setUserInfo]);

	// 앱 실행 시 로컬 저장소(@user)에서 유저 정보 불러오기
	// - 저장된 정보가 없거나 형식이 이상하면 초기화 처리
	useEffect(() => {
		const loadUser = async () => {
			const storedUser = await AsyncStorage.getItem('@user');

			// 로컬에 저장된 유저 정보 없음 → 상태 초기화
			if (!storedUser) {
				setUserInfo(null);
				return;
			}

			try {
				const parsedUser = JSON.parse(storedUser);

				// 저장된 정보가 유효한 형식인지 검증
				if (!parsedUser.uid || typeof parsedUser.uid !== 'string') {
					setUserInfo(null);
					await AsyncStorage.removeItem('@user');
					return;
				}

				// 정상적인 경우 상태에 반영
				setUserInfo(parsedUser);
			} catch (e) {
				console.log('AsyncStorage 유저 파싱 실패:', e);
				setUserInfo(null);
				await AsyncStorage.removeItem('@user');
			}
		};

		loadUser();
	}, [setUserInfo]);

	useEffect(() => {
		console.log('🔐 유저 로그인 후 푸시 토큰 저장', expoPushToken);
		if (!userInfo || !expoPushToken) return;
		if (userInfo.pushToken === expoPushToken) return;

		savePushTokenToFirestore({ uid: userInfo.uid, pushToken: expoPushToken });
	}, [userInfo, expoPushToken]);
};
