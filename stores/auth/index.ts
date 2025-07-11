import {
	getUserInfo,
	savePushTokenToFirestore,
} from '@/firebase/services/userService';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { create } from 'zustand';
import { auth } from '../../fbase';
import { usePushNotificationStore } from '../PushNotificationStore';
import { AppleAuthProvider } from './providers/apple';
import { KakaoAuthProvider } from './providers/kakao';
import { NaverAuthProvider } from './providers/naver';
import { AuthState, AuthStateManager } from './types';
import { initializeAllSDKs } from './utils/initialization';
import {
	clearUserStorage,
	getUserFromStorage,
	saveUserToStorage,
} from './utils/storage';

export { LoginResult } from './types';

// AuthState 상태 생성
export const useAuthStore = create<AuthState>((set, get) => {
	// Provider 클래스가 Zustand 스토어(AuthState)를 직접 알 필요 없이 상태를 조작할 수 있게 해주는 인터페이스
	const stateManager: AuthStateManager = {
		getUserInfo: () => get().userInfo,
		setUserInfo: (user) => set({ userInfo: user }),
		getIsAuthLoading: () => get().isAuthLoading,
		setIsAuthLoading: (loading) => set({ isAuthLoading: loading }),
	};

	// Provider 인스턴스, stateManager를 인자로 전달
	const kakaoProvider = new KakaoAuthProvider(stateManager);
	const naverProvider = new NaverAuthProvider(stateManager);
	const appleProvider = new AppleAuthProvider(stateManager);

	return {
		userInfo: null,
		setUserInfo: stateManager.setUserInfo,
		isAuthLoading: false,
		setIsAuthLoading: stateManager.setIsAuthLoading,

		// Provider 메서드
		kakaoLogin: () => kakaoProvider.login(),
		kakaoLogout: () => kakaoProvider.logout(),
		kakaoDeleteAccount: () => kakaoProvider.deleteAccount(),

		naverLogin: () => naverProvider.login(),
		naverLogout: () => naverProvider.logout(),
		naverDeleteAccount: () => naverProvider.deleteAccount(),

		appleLogin: () => appleProvider.login(),
		appleLogout: () => appleProvider.logout(),
		appleDeleteAccount: () => appleProvider.deleteAccount(),
	};
});

export const useAuthInitializer = () => {
	const userInfo = useAuthStore.getState().userInfo;
	const setUserInfo = useAuthStore.getState().setUserInfo;
	const expoPushToken = usePushNotificationStore.getState().expoPushToken;

	// 🔹 SDK 초기화
	useEffect(() => {
		initializeAllSDKs();
	}, []);

	// 🔹 Firebase Auth 상태 변경 감지
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			// 로그아웃 상태 → 상태 및 저장소 초기화
			if (!user) {
				setUserInfo(null);
				await clearUserStorage();
				return;
			}

			const fetchedUserInfo = await getUserInfo(user.uid);

			// 로그인 상태 & Firestore에 유저 정보가 없는 경우  → 상태 및 저장소 초기화
			if (!fetchedUserInfo) {
				setUserInfo(null);
				await clearUserStorage();
				return;
			}

			// 로그인 상태 & 정상적인 유저 정보 → 상태와 저장소에 동기화
			setUserInfo(fetchedUserInfo);
			await saveUserToStorage(fetchedUserInfo);
		});

		return () => unsubscribe();
	}, [setUserInfo]);

	// 🔹 앱 실행 시 로컬 저장소에서 유저 정보 복원
	useEffect(() => {
		const loadUser = async () => {
			const storedUser = await getUserFromStorage();
			setUserInfo(storedUser);
		};

		loadUser();
	}, [setUserInfo]);

	// 🔹푸시 토큰 저장
	useEffect(() => {
		console.log('🔐 유저 로그인 후 푸시 토큰 저장', expoPushToken);
		if (!userInfo || !expoPushToken) return;
		if (userInfo.pushToken === expoPushToken) return;

		savePushTokenToFirestore({ uid: userInfo.uid, pushToken: expoPushToken });
	}, [userInfo, expoPushToken]);
};
