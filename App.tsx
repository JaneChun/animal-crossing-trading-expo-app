import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { StyleSheet } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { toastConfig } from './components/ui/Toast';
import { useAppState } from './hooks/shared/useAppState';
import { useOnlineManager } from './hooks/shared/useOnlineManager';
import { useSuspensionGuard } from './hooks/shared/useSuspensionGuard';
import { navigationRef } from './navigation/RootNavigation';
import RootStackNavigator from './navigation/RootStackNavigator';
import ErrorBoundary from './screens/ErrorBoundary';
import { useAuthInitializer } from './stores/AuthStore';
import { useBlockSubscriptionInitializer } from './stores/BlockStore';
import { useChatSubscriptionInitializer } from './stores/ChatStore';
import { useNotificationSubscriptionInitializer } from './stores/NotificationStore';
import { usePushNotificationInitializer } from './stores/PushNotificationStore';
import { RootStackParamList } from './types/navigation';

const prefix = Linking.createURL('/');
const linking: LinkingOptions<RootStackParamList> = {
	prefixes: [prefix, 'animal-crossing-trading-app://'],
	config: {
		screens: {
			PostDetail: {
				path: 'post/:collectionName/:id/:notificationId',
			},
			ChatRoom: {
				path: 'chat/:chatId',
			},
		},
	},
};

export default function App() {
	useAuthInitializer();
	usePushNotificationInitializer();
	useNotificationSubscriptionInitializer();
	useChatSubscriptionInitializer();
	useBlockSubscriptionInitializer();
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
					<GestureHandlerRootView style={styles.flex}>
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
								<SafeAreaView
									style={styles.screen}
									edges={['top', 'left', 'right']}
								>
									<RootStackNavigator />
								</SafeAreaView>
								<Toast config={toastConfig} />
							</NavigationContainer>
						</SafeAreaProvider>
					</GestureHandlerRootView>
				</ActionSheetProvider>
			</ErrorBoundary>
		</QueryClientProvider>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
	flex: {
		flex: 1,
	},
});
