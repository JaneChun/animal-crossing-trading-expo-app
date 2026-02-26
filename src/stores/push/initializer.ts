import * as ExpoNotifications from 'expo-notifications';
import { useEffect } from 'react';
import { Alert, Linking } from 'react-native';

import { registerForPushNotificationsAsync } from '@/utilities/registerForPushNotificationsAsync';

import { usePushNotificationStore } from './store';

export const usePushNotificationInitializer = () => {
	const { setExpoPushToken, setNotification, setError } = usePushNotificationStore();

	// 🔹 Push 알림 핸들러 설정
	useEffect(() => {
		ExpoNotifications.setNotificationHandler({
			handleNotification: async () => ({
				shouldShowAlert: true, // 알림 표시
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

		// 사용자가 알림을 탭했을 때 처리하는 리스너
		const responseListener = ExpoNotifications.addNotificationResponseReceivedListener(
			async (response) => {
				const { url } = response.notification.request.content.data;
				if (!url) return;

				// Deep Link URL을 통해 앱 내 특정 화면으로 이동
				try {
					if (typeof url === 'string' && url.trim() !== '') {
						await Linking.openURL(url);
					} else {
						Alert.alert('유효하지 않은 URL', '유효하지 않은 URL입니다.');
					}
				} catch (e) {
					Alert.alert('링크 열기 실패', '링크를 여는 도중 문제가 발생했습니다.');
				}
			},
		);

		return () => {
			ExpoNotifications.removeNotificationSubscription(notificationListener);
			ExpoNotifications.removeNotificationSubscription(responseListener);
		};
	}, [setExpoPushToken, setNotification, setError]);
};
