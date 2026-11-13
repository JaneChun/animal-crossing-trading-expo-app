import * as ExpoNotifications from 'expo-notifications';
import { useEffect } from 'react';

import { registerForPushNotificationsAsync } from '@/utilities/registerForPushNotificationsAsync';

import { addNotificationResponseHandler } from './notificationResponse';
import { usePushNotificationStore } from './store';

export const usePushNotificationInitializer = () => {
	const { setExpoPushToken, setNotification, setError } = usePushNotificationStore();

	// 🔹 Push 알림 핸들러 설정
	useEffect(() => {
		ExpoNotifications.setNotificationHandler({
			handleNotification: async () => ({
				shouldShowAlert: true, // 알림 표시
				shouldShowBanner: true, // 배너 표시 (iOS)
				shouldShowList: true, // 알림 센터 목록 표시 (iOS)
				shouldPlaySound: true, // 사운드 재생
				shouldSetBadge: true, // 앱 아이콘 배지 설정
			}),
		});
	}, []);

	// 🔹 Push Token 등록 및 알림 리스너 설정
	useEffect(() => {
		// Push Token 등록 & 저장
		registerForPushNotificationsAsync().then(
			(token) => setExpoPushToken(token ?? null),
			(error) => setError(error),
		);

		// 앱이 foreground에서 실행 중일 때 알림 수신 리스너
		const notificationListener = ExpoNotifications.addNotificationReceivedListener(
			(notification) => {
				setNotification(notification);
			},
		);

		// 사용자가 알림을 탭했을 때 처리하는 리스너 (흐름은 notificationResponse.ts 참조)
		const responseListener = addNotificationResponseHandler();

		return () => {
			notificationListener.remove();
			responseListener.remove();
		};
	}, [setExpoPushToken, setNotification, setError]);
};
