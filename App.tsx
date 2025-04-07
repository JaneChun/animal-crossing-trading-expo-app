import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { toastConfig } from './components/ui/Toast';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import ErrorBoundary from './screens/ErrorBoundary';

const prefix = Linking.createURL('/');

const linking = {
	prefixes: [prefix, 'animal-crossing-trading-app://'],
	config: {
		screens: {
			HomeTab: { path: 'home' },
			CommunityTab: { path: 'community' },
			NoticeTab: { path: 'notice' },
			ChatTab: { path: 'chat' },
			ProfileTab: { path: 'profile' },
		},
	},
};

export default function App() {
	return (
		<ErrorBoundary>
			<ActionSheetProvider>
				<GestureHandlerRootView>
					<NavigationContainer
						linking={linking}
						onReady={() => {
							console.log('🔵 Navigation Ready');
						}}
						onStateChange={(state) => {
							console.log(
								'🟡 Navigation State:',
								JSON.stringify(state, null, 2),
							);
						}}
					>
						<BottomTabNavigator />
					</NavigationContainer>
					<Toast config={toastConfig} />
				</GestureHandlerRootView>
			</ActionSheetProvider>
		</ErrorBoundary>
	);
}
