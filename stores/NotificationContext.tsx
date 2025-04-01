import { registerForPushNotificationsAsync } from '@/utilities/registerForPushNotificationsAsync';
import * as Notifications from 'expo-notifications';
import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';

interface NotificationContextType {
	expoPushToken: string | null;
	notification: Notifications.Notification | null;
	error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>({
	expoPushToken: null,
	notification: null,
	error: null,
});

export const useNotification = () => {
	const context = useContext(NotificationContext);
	if (context === undefined) {
		throw new Error(
			'useNotification must be used within a NotificationProvider',
		);
	}
	return context;
};

interface NotificationProviderProps {
	children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
	children,
}) => {
	const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
	const [notification, setNotification] =
		useState<Notifications.Notification | null>(null);
	const [error, setError] = useState<Error | null>(null);

	const notificationListener = useRef<any>();
	const responseListener = useRef<any>();

	useEffect(() => {
		registerForPushNotificationsAsync().then(
			(token) => setExpoPushToken(token),
			(error) => setError(error),
		);

		notificationListener.current =
			// This listener is fired whenever a notification is received while the app is running.
			Notifications.addNotificationReceivedListener((notification) => {
				console.log(
					'🔔 Notification Received while the app is running: ',
					notification,
				);
				setNotification(notification);
			});

		responseListener.current =
			// This listener is fired whenever a user interacts with a notification (e.g. taps on it).
			Notifications.addNotificationResponseReceivedListener((response) => {
				console.log(
					'🔔 Notification Response: user interacts with a notification',
					JSON.stringify(response, null, 2),
					JSON.stringify(response.notification.request.content.data, null, 2),
				);
				// Handle the notification response here
			});

		return () => {
			if (notificationListener.current) {
				Notifications.removeNotificationSubscription(
					notificationListener.current,
				);
			}
			if (responseListener.current) {
				Notifications.removeNotificationSubscription(responseListener.current);
			}
		};
	}, []);

	return (
		<NotificationContext.Provider
			value={{ expoPushToken, notification, error }}
		>
			{children}
		</NotificationContext.Provider>
	);
};
