import { toastConfig } from '@/components/ui/Toast';
import BottomTabNavigator from '@/navigation/BottomTabNavigator';
import ErrorBoundary from '@/screens/ErrorBoundary';
import { useAuthInitializer } from '@/stores/AuthStore';
import { useNotificationInitializer } from '@/stores/NotificationStore';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

export default function Index() {
	useAuthInitializer();
	useNotificationInitializer();

	return (
		<ErrorBoundary>
			<ActionSheetProvider>
				<GestureHandlerRootView>
					<BottomTabNavigator />
					<Toast config={toastConfig} />
				</GestureHandlerRootView>
			</ActionSheetProvider>
		</ErrorBoundary>
	);
}
