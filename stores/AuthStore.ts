import {
	ensureUserExists,
	getFirebaseCustomToken,
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
import { login, logout } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import {
	deleteUser,
	OAuthProvider,
	onAuthStateChanged,
	reauthenticateWithCredential,
	signInWithCustomToken,
} from 'firebase/auth';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { auth } from '../fbase';
import firebaseRequest from '../firebase/core/firebaseInterceptor';
import { usePushNotificationStore } from './PushNotificationStore';

type AuthState = {
	userInfo: UserInfo | null;
	setUserInfo: (user: UserInfo | null) => void;
	isAuthLoading: boolean;
	setIsAuthLoading: (loading: boolean) => void;
	kakaoLogin: () => Promise<boolean>;
	kakaoLogout: () => Promise<boolean>;
	kakaoDeleteAccount: (uid: string) => Promise<boolean>;
	naverLogin: () => Promise<boolean>;
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

		const isSuccess = await firebaseRequest('로그인', async () => {
			const firebaseUser = await loginWithKakao();
			if (!firebaseUser) return false;

			const userInfo = await ensureUserExists(firebaseUser, 'kakao');
			await updateLastLogin(userInfo.uid);

			// 로컬 상태 업데이트
			setUserInfo(userInfo);
			await AsyncStorage.setItem('@user', JSON.stringify(userInfo));

			return true;
		}).catch(() => false);

		setIsAuthLoading(false);
		return isSuccess;
	},
	kakaoLogout: async () => {
		const setIsAuthLoading = useAuthStore.getState().setIsAuthLoading;
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
			const kakaoTokenInfo = await login();
			const provider = new OAuthProvider('oidc.kakao');
			const credential = provider.credential({
				idToken: kakaoTokenInfo.idToken,
			});

			await reauthenticateWithCredential(user, credential);

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

		const isSuccess = await firebaseRequest('로그인', async () => {
			const firebaseUser = await loginWithNaver();
			if (!firebaseUser) return false;

			const userInfo = await ensureUserExists(firebaseUser, 'naver');
			await updateLastLogin(userInfo.uid);

			// 로컬 상태 업데이트
			setUserInfo(userInfo);
			await AsyncStorage.setItem('@user', JSON.stringify(userInfo));

			return true;
		}).catch(() => false);

		setIsAuthLoading(false);
		return isSuccess;
	},
	naverLogout: async () => {
		const setIsAuthLoading = useAuthStore.getState().setIsAuthLoading;
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
			const { failureResponse, successResponse } = await NaverLogin.login();
			if (failureResponse) return false;
			const firebaseCustomToken = await getFirebaseCustomToken(
				successResponse!.accessToken,
			);

			await signInWithCustomToken(auth, firebaseCustomToken);

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

	// Firebase Auth 상태 변화 감지하여 userInfo 저장
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			const storedUser = await AsyncStorage.getItem('user');
			if (!storedUser) return;

			const parsedUser = JSON.parse(storedUser);
			const oauthType = parsedUser.oauthType;
			if (!oauthType) return;

			if (!user) {
				setUserInfo(null);
				await AsyncStorage.removeItem('@user');
				return;
			}

			// Firestore에 유저 정보가 없으면 저장 후 다시 가져오기
			await ensureUserExists(user, oauthType);
			const fetchedUserInfo = await getUserInfo(user.uid);

			// 여전히 유저 정보가 없으면 Alert 표시
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
		});
		return () => unsubscribe();
	}, [setUserInfo]);

	// 로컬 저장소(AsyncStorage)와 상태를 동기화
	useEffect(() => {
		const loadUser = async () => {
			const storedUser = await AsyncStorage.getItem('@user');

			if (!storedUser) {
				setUserInfo(null);
				return;
			}

			// 데이터 검증
			try {
				const parsedUser = JSON.parse(storedUser);

				if (!parsedUser.uid || typeof parsedUser.uid !== 'string') {
					setUserInfo(null);
					await AsyncStorage.removeItem('@user');
					return;
				}

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
