// RootNavigator.tsx
import { Colors } from '@/constants/Color';
import Account from '@/screens/Account';
import ChatRoom from '@/screens/ChatRoom';
import DeleteAccount from '@/screens/DeleteAccount';
import EditComment from '@/screens/EditComment';
import NewPost from '@/screens/NewPost';
import PostDetail from '@/screens/PostDetail';
import Profile from '@/screens/Profile';
import Search from '@/screens/Search';
import Setting from '@/screens/Setting';
import SignUpDisplayName from '@/screens/SignUpDisplayName';
import SignUpIslandName from '@/screens/SignUpIslandName';
import SocialAccountCheck from '@/screens/SocialAccountCheck';
import { useAuthStore } from '@/stores/AuthStore';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';

const RootStack = createNativeStackNavigator();

const RootStackNavigator = () => {
	const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

	const commonOptions = {
		headerShown: isAuthLoading ? false : true,
		title: '',
		headerTintColor: Colors.font_black,
		headerBackButtonDisplayMode: 'minimal' as 'minimal',
	};

	return (
		<RootStack.Navigator screenOptions={{ headerShown: false }}>
			{/* 탭바 O */}
			<RootStack.Screen name='MainTab' component={MainTabNavigator} />

			{/* 글로벌 스택 스크린 - 탭바 X */}
			<RootStack.Screen
				name='PostDetail'
				component={PostDetail}
				options={commonOptions}
			/>

			<RootStack.Screen
				name='NewPost'
				children={() => (
					// <AuthGuard>
					<NewPost />
					// </AuthGuard>
				)}
				options={{ ...commonOptions, title: '새 글 작성' }}
			/>
			<RootStack.Screen
				name='Profile'
				component={Profile}
				options={commonOptions}
			/>
			<RootStack.Screen
				name='SignUpDisplayName'
				component={SignUpDisplayName}
				options={{ ...commonOptions, headerShown: false }}
			/>
			<RootStack.Screen
				name='SignUpIslandName'
				component={SignUpIslandName}
				options={{ ...commonOptions, headerShown: false }}
			/>
			<RootStack.Screen
				name='EditComment'
				children={() => (
					// <AuthGuard>
					<EditComment />
					// </AuthGuard>
				)}
				options={{
					...commonOptions,
					title: '댓글 수정',
					presentation: 'modal',
				}}
			/>
			<RootStack.Screen
				name='ChatRoom'
				children={() => (
					// <AuthGuard>
					<ChatRoom />
					// </AuthGuard>
				)}
				options={{ ...commonOptions, headerShown: false }}
			/>
			<RootStack.Screen
				name='Setting'
				children={() => (
					// <AuthGuard>
					<Setting />
					// </AuthGuard>
				)}
				options={{ ...commonOptions, title: '설정' }}
			/>
			<RootStack.Screen
				name='Account'
				children={() => (
					// <AuthGuard>
					<Account />
					// </AuthGuard>
				)}
				options={{ ...commonOptions, title: '내 계정' }}
			/>
			<RootStack.Screen
				name='SocialAccountCheck'
				children={() => (
					// <AuthGuard>
					<SocialAccountCheck />
					// </AuthGuard>
				)}
				options={{ ...commonOptions, headerShown: false }}
			/>

			<RootStack.Screen
				name='DeleteAccount'
				children={() => (
					// <AuthGuard>
					<DeleteAccount />
					// </AuthGuard>
				)}
				options={{ ...commonOptions, headerShown: false }}
			/>
			<RootStack.Screen
				name='Search'
				component={Search}
				options={{ ...commonOptions, headerShown: false }}
			/>
		</RootStack.Navigator>
	);
};

export default RootStackNavigator;
