import { toastConfig } from '@/components/ui/Toast';
import {
	NotificationProvider,
	useNotification,
} from '@/contexts/NotificationContext';
import BottomTabNavigator from '@/navigation/BottomTabNavigator';
import ErrorBoundary from '@/screens/ErrorBoundary';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { AuthContextProvider } from '../contexts/AuthContext';

export default function Index() {
	const { notification, expoPushToken, error } = useNotification();
	console.log('expoPushToken', expoPushToken);

	useEffect(() => {
		if (notification) {
			console.log('📩 알림 수신 완료:', notification.request.content);
		}
	}, [notification]);

	if (error) {
		console.log(error.message);
	}

	useEffect(() => {
		Notifications.setNotificationHandler({
			handleNotification: async () => ({
				shouldShowAlert: true,
				shouldPlaySound: true,
				shouldSetBadge: true,
			}),
		});
	}, []);

	return (
		<ErrorBoundary>
			<NotificationProvider>
				<AuthContextProvider>
					<ActionSheetProvider>
						<GestureHandlerRootView>
							<BottomTabNavigator />
							<Toast config={toastConfig} />
						</GestureHandlerRootView>
					</ActionSheetProvider>
				</AuthContextProvider>
			</NotificationProvider>
		</ErrorBoundary>
	);
}
