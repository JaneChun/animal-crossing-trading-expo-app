import * as ExpoNotifications from 'expo-notifications';
import { useEffect } from 'react';
import { Alert, Linking } from 'react-native';

import { logAppOpen, notificationOpenedApp } from '@/utilities/analytics';
import { registerForPushNotificationsAsync } from '@/utilities/registerForPushNotificationsAsync';

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

		// launchResponseId: 앱 시작 시점의 마지막으로 탭한 알림 응답 ID
		// - 알림 탭으로 실행된 경우: 그 알림의 identifier
		// - 아이콘 탭 등 일반 실행인 경우: undefined
		const launchResponseId =
			ExpoNotifications.getLastNotificationResponse()?.notification.request.identifier;

		// 사용자가 알림을 탭했을 때 처리하는 리스너
		const responseListener = ExpoNotifications.addNotificationResponseReceivedListener(
			async (response) => {
				notificationOpenedApp.current = true;
				// 콜드 스타트 알림의 화면 이동은 getInitialURL(App.tsx)이 처리한다.
				// - Android: 콜드 스타트에서는 리스너가 호출되지 않으므로 별도 처리가 필요 없다
				// - iOS: 보관해 둔 응답을 리스너에 다시 전달하므로, 중복 이동을 막기 위해 launch 응답은 건너뛴다
				if (response.notification.request.identifier === launchResponseId) return;

				logAppOpen('push_notification');

				const data = response.notification.request.content.data;
				const url = data?.url;
				if (!url) return;

				// Deep Link URL을 통해 앱 내 특정 화면으로 이동
				try {
					if (typeof url === 'string' && url.trim() !== '') {
						await Linking.openURL(url);
					} else {
						Alert.alert('유효하지 않은 URL', '유효하지 않은 URL입니다.');
					}
				} catch {
					Alert.alert('링크 열기 실패', '링크를 여는 도중 문제가 발생했습니다.');
				}
			},
		);

		return () => {
			notificationListener.remove();
			responseListener.remove();
		};
	}, [setExpoPushToken, setNotification, setError]);
};
