import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { toastConfig } from './components/ui/Toast';
import { useAppState } from './hooks/shared/useAppState';
import { useOnlineManager } from './hooks/shared/useOnlineManager';
import { useSuspensionGuard } from './hooks/shared/useSuspensionGuard';
import { navigationRef } from './navigation/RootNavigation';
import RootStackNavigator from './navigation/RootStackNavigator';
import ErrorBoundary from './screens/ErrorBoundary';
import { useAuthInitializer } from './stores/AuthStore';
import { useChatSubscriptionInitializer } from './stores/ChatStore';
import { useNotificationSubscriptionInitializer } from './stores/NotificationStore';
import { usePushNotificationInitializer } from './stores/PushNotificationStore';

const prefix = Linking.createURL('/');

const linking = {
	prefixes: [prefix, 'animal-crossing-trading-app://'],
	config: {
		screens: {
			HomeTab: {
				path: 'home',
				screens: {
					PostDetail: 'post/:id',
				},
			},
			CommunityTab: {
				path: 'community',
				screens: {
					PostDetail: 'post/:id',
				},
			},
			ChatTab: {
				path: 'chat',
				screens: {
					ChatRoom: 'room/:chatId',
				},
			},
		},
	},
};

export default function App() {
	useAuthInitializer();
	usePushNotificationInitializer();
	useNotificationSubscriptionInitializer();
	useChatSubscriptionInitializer();
	useSuspensionGuard();

	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: 2 } },
	});

	useOnlineManager();
	useAppState();

	return (
		<QueryClientProvider client={queryClient}>
			<ErrorBoundary>
				<ActionSheetProvider>
					<GestureHandlerRootView style={{ flex: 1 }}>
						<SafeAreaProvider>
							<NavigationContainer
								ref={navigationRef}
								linking={linking}
								// onReady={() => {
								// 	console.log('🔵 Navigation Ready');
								// }}
								// onStateChange={(state) => {
								// 	console.log(
								// 		'🟡 Navigation State:',
								// 		JSON.stringify(state, null, 2),
								// 	);
								// }}
							>
								<RootStackNavigator />
								<Toast config={toastConfig} />
							</NavigationContainer>
						</SafeAreaProvider>
					</GestureHandlerRootView>
				</ActionSheetProvider>
			</ErrorBoundary>
		</QueryClientProvider>
	);
}
