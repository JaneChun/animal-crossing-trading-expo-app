import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { useRef } from 'react';
import { StyleSheet } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { logScreenView } from '@/config/analytics';
import { toastConfig } from '@/components/ui/Toast';
import { useAppState } from '@/hooks/shared/useAppState';
import { useOnlineManager } from '@/hooks/shared/useOnlineManager';
import { useSuspensionGuard } from '@/hooks/shared/useSuspensionGuard';
import { navigationRef } from '@/navigation/RootNavigation';
import RootStackNavigator from '@/navigation/RootStackNavigator';
import ErrorBoundary from '@/screens/ErrorBoundary';
import { useAuthInitializer } from '@/stores/auth';
import { useBlockSubscriptionInitializer } from '@/stores/block';
import { useChatSubscriptionInitializer } from '@/stores/chat';
import { useNotificationSubscriptionInitializer } from '@/stores/notification';
import { useOnboardingInitializer } from '@/stores/onboarding/initializer';
import { usePushNotificationInitializer } from '@/stores/push';
import { RootStackParamList } from '@/types/navigation';

if (__DEV__) {
	import('./src/config/reactotron').then(() => console.log('🔧 Reactotron Config Loaded'));
}

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
	useOnboardingInitializer();
	useSuspensionGuard();

	// 이전 화면 이름을 저장하는 ref (for Analytics)
	const prevRouteNameRef = useRef<string | undefined>();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 10, retry: 1 },
			mutations: {
				retry: 1,
			},
		},
	});

	useOnlineManager();
	useAppState();

	return (
		// <StrictMode>
		<QueryClientProvider client={queryClient}>
			<ErrorBoundary>
				<ActionSheetProvider>
					<GestureHandlerRootView style={styles.flex}>
						<SafeAreaProvider>
							<NavigationContainer
								ref={navigationRef}
								linking={linking}
								onReady={() => {
									prevRouteNameRef.current = navigationRef.getCurrentRoute()?.name;
								}}
								onStateChange={() => {
									const currentRouteName = navigationRef.getCurrentRoute()?.name;
									if (prevRouteNameRef.current !== currentRouteName && currentRouteName) {
										logScreenView(currentRouteName).catch(() => {}); // Analytics 실패 무시
									}
									prevRouteNameRef.current = currentRouteName;
								}}
							>
								<SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
									<RootStackNavigator />
								</SafeAreaView>
								<Toast config={toastConfig} />
							</NavigationContainer>
						</SafeAreaProvider>
					</GestureHandlerRootView>
				</ActionSheetProvider>
			</ErrorBoundary>
		</QueryClientProvider>
		// </StrictMode>
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
