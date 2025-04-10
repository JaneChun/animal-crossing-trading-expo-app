import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { toastConfig } from './components/ui/Toast';
import { useAppState } from './hooks/shared/useAppState';
import { useOnlineManager } from './hooks/shared/useOnlineManager';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import ErrorBoundary from './screens/ErrorBoundary';
import { useAuthInitializer } from './stores/AuthStore';
import { useNotificationInitializer } from './stores/NotificationStore';

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
	useNotificationInitializer();

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
						<NavigationContainer
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
							<SafeAreaView style={{ flex: 1 }}>
								<BottomTabNavigator />
								<Toast config={toastConfig} />
							</SafeAreaView>
						</NavigationContainer>
					</GestureHandlerRootView>
				</ActionSheetProvider>
			</ErrorBoundary>
		</QueryClientProvider>
	);
}
