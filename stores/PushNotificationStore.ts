import { registerForPushNotificationsAsync } from '@/utilities/registerForPushNotificationsAsync';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import { create } from 'zustand';

type NotificationState = {
	expoPushToken: string | null;
	setExpoPushToken: (token: string | null) => void;
	notification: Notifications.Notification | null;
	setNotification: (notification: Notifications.Notification | null) => void;
	error: Error | null;
	setError: (error: Error | null) => void;
};

export const usePushNotificationStore = create<NotificationState>((set) => ({
	expoPushToken: null,
	notification: null,
	error: null,
	setExpoPushToken: (token) => set({ expoPushToken: token }),
	setNotification: (notification) => set({ notification }),
	setError: (error) => set({ error }),
}));

export const usePushNotificationInitializer = () => {
	const setExpoPushToken = usePushNotificationStore(
		(state) => state.setExpoPushToken,
	);
	const setNotification = usePushNotificationStore(
		(state) => state.setNotification,
	);
	const setError = usePushNotificationStore((state) => state.setError);

	useEffect(() => {
		Notifications.setNotificationHandler({
			handleNotification: async () => ({
				shouldShowAlert: true,
				shouldPlaySound: true,
				shouldSetBadge: true,
			}),
		});
	}, []);

	useEffect(() => {
		registerForPushNotificationsAsync().then(
			(token) => setExpoPushToken(token ?? null),
			(error) => setError(error),
		);

		const notificationListener = Notifications.addNotificationReceivedListener(
			(notification) => {
				console.log('🔔 앱이 실행 중 알림 수신: ', notification);
				setNotification(notification);
			},
		);

		const responseListener =
			Notifications.addNotificationResponseReceivedListener(
				async (response) => {
					console.log(
						'🔔 유저 상호작용: ',
						JSON.stringify(response.notification.request.content.data, null, 2),
					);

					const { url } = response.notification.request.content.data;
					if (!url) return;

					try {
						if (typeof url === 'string' && url.trim() !== '') {
							await Linking.openURL(url);
						} else {
							Alert.alert('유효하지 않은 URL', '유효하지 않은 URL입니다.');
							console.log('Invalid URL:', url);
						}
					} catch (e) {
						Alert.alert(
							'링크 열기 실패',
							'링크를 여는 도중 문제가 발생했습니다.',
						);
						console.log('Failed to open URL:', e);
					}
				},
			);

		return () => {
			Notifications.removeNotificationSubscription(notificationListener);
			Notifications.removeNotificationSubscription(responseListener);
		};
	}, [setExpoPushToken, setNotification, setError]);
};
