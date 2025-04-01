import { registerForPushNotificationsAsync } from '@/utilities/registerForPushNotificationsAsync';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { create } from 'zustand';

type NotificationState = {
	expoPushToken: string | null;
	setExpoPushToken: (token: string | null) => void;
	notification: Notifications.Notification | null;
	setNotification: (notification: Notifications.Notification | null) => void;
	error: Error | null;
	setError: (error: Error | null) => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
	expoPushToken: null,
	notification: null,
	error: null,
	setExpoPushToken: (token) => set({ expoPushToken: token }),
	setNotification: (notification) => set({ notification }),
	setError: (error) => set({ error }),
}));

export const useNotificationInitializer = () => {
	const setExpoPushToken = useNotificationStore(
		(state) => state.setExpoPushToken,
	);
	const setNotification = useNotificationStore(
		(state) => state.setNotification,
	);
	const setError = useNotificationStore((state) => state.setError);

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
			(token) => setExpoPushToken(token),
			(error) => setError(error),
		);

		const notificationListener = Notifications.addNotificationReceivedListener(
			(notification) => {
				console.log('🔔 앱이 실행 중 알림 수신: ', notification);
				setNotification(notification);
			},
		);

		const responseListener =
			Notifications.addNotificationResponseReceivedListener((response) => {
				console.log(
					'🔔 유저 상호작용: ',
					JSON.stringify(response, null, 2),
					JSON.stringify(response.notification.request.content.data, null, 2),
				);
				// Handle the notification response here
			});

		return () => {
			Notifications.removeNotificationSubscription(notificationListener);
			Notifications.removeNotificationSubscription(responseListener);
		};
	}, [setExpoPushToken, setNotification, setError]);
};
