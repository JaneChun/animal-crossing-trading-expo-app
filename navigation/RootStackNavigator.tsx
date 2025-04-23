// RootNavigator.tsx
import { Colors } from '@/constants/Color';
import ChatRoom from '@/screens/ChatRoom';
import EditComment from '@/screens/EditComment';
import NewPost from '@/screens/NewPost';
import PostDetail from '@/screens/PostDetail';
import Profile from '@/screens/Profile';
import Search from '@/screens/Search';
import Setting from '@/screens/Setting';
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
		headerBackButtonDisplayMode: 'minimal',
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
				component={NewPost}
				options={{ ...commonOptions, title: '새 글 작성' }}
			/>
			<RootStack.Screen
				name='Profile'
				component={Profile}
				options={commonOptions}
			/>
			<RootStack.Screen
				name='EditComment'
				component={EditComment}
				options={{
					...commonOptions,
					title: '댓글 수정',
					presentation: 'modal',
				}}
			/>
			<RootStack.Screen
				name='ChatRoom'
				component={ChatRoom}
				options={{ ...commonOptions, headerShown: false }}
			/>
			<RootStack.Screen
				name='Setting'
				component={Setting}
				options={commonOptions}
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
