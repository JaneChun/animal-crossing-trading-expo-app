import { toastConfig } from '@/components/ui/Toast';
import BottomTabNavigator from '@/navigation/BottomTabNavigator';
import ErrorBoundary from '@/screens/ErrorBoundary';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { AuthContextProvider } from '../contexts/AuthContext';

export default function Index() {
	return (
		<ErrorBoundary>
			<AuthContextProvider>
				<ActionSheetProvider>
					<GestureHandlerRootView>
						<BottomTabNavigator />
						<Toast config={toastConfig} />
					</GestureHandlerRootView>
				</ActionSheetProvider>
			</AuthContextProvider>
		</ErrorBoundary>
	);
}
