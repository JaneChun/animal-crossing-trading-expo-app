import * as Notifications from 'expo-notifications';

export interface PushNotificationState {
	expoPushToken: string | null;
	setExpoPushToken: (token: string | null) => void;
	notification: Notifications.Notification | null;
	setNotification: (notification: Notifications.Notification | null) => void;
	error: Error | null;
	setError: (error: Error | null) => void;
}

export interface PushNotificationActions {
	resetStore: () => void;
}

export interface PushNotificationStore
	extends PushNotificationState,
		PushNotificationActions {}
