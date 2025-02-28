import { Colors } from '@/constants/Color';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import {
	Entypo,
	FontAwesome,
	FontAwesome6,
	MaterialCommunityIcons,
} from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { AuthContextProvider, useAuthContext } from '../contexts/AuthContext';

// 스크린 import
import { toastConfig } from '@/components/ui/Toast';
import AddItem from '@/screens/AddItem';
import Chat from '@/screens/Chat';
import ChatRoom from '@/screens/ChatRoom';
import EditComment from '@/screens/EditComment';
import EditProfile from '@/screens/EditProfile';
import ErrorBoundary from '@/screens/ErrorBoundary';
import Home from '@/screens/Home';
import Login from '@/screens/Login';
import NewPost from '@/screens/NewPost';
import PostDetail from '@/screens/PostDetail';
import Profile from '@/screens/Profile';
import Search from '@/screens/Search';
import Setting from '@/screens/Setting';

// 네비게이터 생성
const BottomTab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();
const NewPostStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const HomeStackNavigator = () => {
	return (
		<HomeStack.Navigator
			screenOptions={{
				title: '모동숲 마켓',
				headerRight: () => (
					<FontAwesome name='leaf' color={Colors.primary} size={24} />
				),
			}}
		>
			<HomeStack.Screen name='Home' component={Home} />
			<HomeStack.Screen name='PostDetail' component={PostDetail} />
			<HomeStack.Screen
				name='NewPost'
				component={NewPost}
				options={{
					presentation: 'modal',
					title: '글 수정',
				}}
			/>
			<HomeStack.Screen
				name='EditComment'
				component={EditComment}
				options={{
					presentation: 'modal',
					title: '댓글 수정',
				}}
			/>
		</HomeStack.Navigator>
	);
};

const ProfileStackNavigator = () => {
	const { userInfo } = useAuthContext();

	return (
		<ProfileStack.Navigator screenOptions={{ headerShown: false }}>
			{userInfo ? (
				<>
					<ProfileStack.Screen
						name='Profile'
						component={Profile}
						options={{ title: '프로필' }}
					/>
					<ProfileStack.Screen
						name='EditProfile'
						component={EditProfile}
						options={{
							headerShown: true,
							presentation: 'modal',
							title: '프로필 수정',
						}}
					/>
					<ProfileStack.Screen
						name='Setting'
						component={Setting}
						options={{
							headerShown: true,
							title: '설정',
						}}
					/>
				</>
			) : (
				<BottomTab.Screen
					name='Login'
					component={Login}
					options={{
						tabBarIcon: ({ focused }) => (
							<Entypo
								name='login'
								size={24}
								color={focused ? Colors.primary : Colors.dark_gray}
							/>
						),
					}}
				/>
			)}
		</ProfileStack.Navigator>
	);
};

const ChatStackNavigator = () => {
	return (
		<ChatStack.Navigator screenOptions={{ headerShown: false }}>
			<ChatStack.Screen name='Chat' component={Chat} />
			<ChatStack.Screen name='ChatRoom' component={ChatRoom} />
		</ChatStack.Navigator>
	);
};

const NewPostStackNavigator = () => {
	return (
		<NewPostStack.Navigator>
			<NewPostStack.Screen
				name='NewPost'
				component={NewPost}
				options={{ title: '' }}
			/>
			<NewPostStack.Screen
				name='AddItem'
				component={AddItem}
				options={{ title: '아이템 추가' }}
			/>
		</NewPostStack.Navigator>
	);
};

const BottomTabNavigator = () => {
	return (
		<BottomTab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					height: 60,
					paddingBottom: 0,
				},
				tabBarShowLabel: false,
				tabBarActiveBackgroundColor: Colors.base,
				tabBarIconStyle: { flex: 1 },
			}}
		>
			<BottomTab.Screen
				name='HomeTab'
				component={HomeStackNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<Entypo
							name='home'
							size={24}
							color={focused ? Colors.primary : Colors.dark_gray}
						/>
					),
				}}
			/>
			<BottomTab.Screen
				name='ChatTab'
				component={ChatStackNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<MaterialCommunityIcons
							name='chat'
							size={24}
							color={focused ? Colors.primary : Colors.dark_gray}
						/>
					),
				}}
			/>
			<BottomTab.Screen
				name='NewPostTab'
				component={NewPostStackNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<FontAwesome6
							name='circle-plus'
							size={20}
							color={focused ? Colors.primary : Colors.dark_gray}
						/>
					),
				}}
			/>
			<BottomTab.Screen
				name='SearchTab'
				component={Search}
				options={{
					tabBarIcon: ({ focused }) => (
						<FontAwesome
							name='search'
							size={22}
							color={focused ? Colors.primary : Colors.dark_gray}
						/>
					),
				}}
			/>
			<BottomTab.Screen
				name='ProfileTab'
				component={ProfileStackNavigator}
				options={{
					tabBarIcon: ({ focused }) => (
						<FontAwesome6
							name='user-large'
							size={21}
							color={focused ? Colors.primary : Colors.dark_gray}
						/>
					),
				}}
			/>
		</BottomTab.Navigator>
	);
};

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
