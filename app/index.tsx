import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
	Entypo,
	FontAwesome,
	FontAwesome6,
	MaterialCommunityIcons,
} from '@expo/vector-icons';

import Home from '@/screens/Home';
import PostDetail from '@/screens/PostDetail';
import MyChat from '@/screens/MyChat';
import NewPost from '@/screens/NewPost';
import Search from '@/screens/Search';
import Login from '@/screens/Login';
import MyPage from '@/screens/MyPage';
import { Colors } from '@/constants/Color';

import { AuthContextProvider, useAuthContext } from '../contexts/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Button from '@/components/ui/Button';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import EditProfile from '@/screens/EditProfile';
import EditComment from '@/screens/EditComment';

const Stack = createNativeStackNavigator();
const BottomTab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

const HomeStack = () => {
	return (
		<Stack.Navigator
			screenOptions={{
				title: '모동숲 마켓',
				headerRight: () => (
					<FontAwesome name='leaf' color={Colors.primary} size={24} />
				),
			}}
		>
			<Stack.Screen name='Post' component={Home} />
			<Stack.Screen name='PostDetail' component={PostDetail} />
			<Stack.Screen
				name='NewPost'
				component={NewPost}
				options={{
					presentation: 'modal',
					title: '글 수정',
					headerRight: () => (
						<Button color='white' size='md2'>
							등록
						</Button>
					),
				}}
			/>
			<Stack.Screen
				name='EditComment'
				component={EditComment}
				options={{
					presentation: 'modal',
					title: '댓글 수정',
				}}
			/>
		</Stack.Navigator>
	);
};

const MyPageStack = () => {
	return (
		<ProfileStack.Navigator screenOptions={{ headerShown: false }}>
			<ProfileStack.Screen name='MyPage' component={MyPage} />
			<ProfileStack.Screen
				name='EditProfile'
				component={EditProfile}
				options={{
					headerShown: true,
					presentation: 'modal',
					title: '프로필 수정',
				}}
			/>
		</ProfileStack.Navigator>
	);
};

const BottomTabNavigator = () => {
	const { userInfo } = useAuthContext();

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
				name='Home'
				component={HomeStack}
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
				name='MyChat'
				component={MyChat}
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
				name='NewPost'
				component={NewPost}
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
				name='Search'
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
			{userInfo ? (
				<BottomTab.Screen
					name='MyPage'
					component={MyPageStack}
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
		</BottomTab.Navigator>
	);
};

export default function Index() {
	return (
		<AuthContextProvider>
			<ActionSheetProvider>
				<GestureHandlerRootView>
					<BottomTabNavigator />
				</GestureHandlerRootView>
			</ActionSheetProvider>
		</AuthContextProvider>
	);
}
