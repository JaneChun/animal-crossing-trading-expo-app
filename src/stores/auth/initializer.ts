import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';

import { auth } from '@/config/firebase';
import { getUserInfo, savePushTokenToFirestore } from '@/firebase/services/userService';
import { usePushNotificationStore } from '@/stores/push';

import { useAuthStore } from './store';
import { initializeAllSDKs } from './utils/initialization';
import { clearUserStorage, getUserFromStorage, saveUserToStorage } from './utils/storage';

export const useAuthInitializer = () => {
	const { userInfo, setUserInfo } = useAuthStore.getState();
	const expoPushToken = usePushNotificationStore.getState().expoPushToken;

	// 🔹 SDK 초기화
	useEffect(() => {
		initializeAllSDKs();
	}, []);

	// 🔹 Firebase Auth 상태 변경 감지 리스너 설정
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

	// 🔹 푸시 토큰 저장
	useEffect(() => {
		console.log('🔐 유저 로그인 후 푸시 토큰 저장', expoPushToken);
		if (!userInfo || !expoPushToken) return;
		if (userInfo.pushToken === expoPushToken) return;

		savePushTokenToFirestore({ uid: userInfo.uid, pushToken: expoPushToken });
	}, [userInfo, expoPushToken]);
};
