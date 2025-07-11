// RootNavigator.tsx
import { Colors } from '@/constants/Color';
import Account from '@/screens/Account';
import AgreeToTermsAndConditions from '@/screens/AgreeToTermsAndConditions';
import Block from '@/screens/Block';
import ChatRoom from '@/screens/ChatRoom';
import DeleteAccount from '@/screens/DeleteAccount';
import NewPost from '@/screens/NewPost';
import PostDetail from '@/screens/PostDetail';
import PrivacyPolicy from '@/screens/PrivacyPolicy';
import Profile from '@/screens/Profile';
import Search from '@/screens/Search';
import Setting from '@/screens/Setting';
import SignUpDisplayName from '@/screens/SignUpDisplayName';
import SignUpIslandName from '@/screens/SignUpIslandName';
import SocialAccountCheck from '@/screens/SocialAccountCheck';
import TermsOfService from '@/screens/TermsOfService';
import { useAuthStore } from '@/stores/auth';
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
				options={{ ...commonOptions, headerShown: false }}
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
				name='AgreeToTermsAndConditions'
				children={() => (
					// <AuthGuard>
					<AgreeToTermsAndConditions />
					// </AuthGuard>
				)}
				options={{ ...commonOptions, headerShown: false }}
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
				name='Block'
				children={() => (
					// <AuthGuard>
					<Block />
					// </AuthGuard>
				)}
				options={{ ...commonOptions, title: '차단 사용자 관리' }}
			/>
			<RootStack.Screen
				name='TermsOfService'
				children={() => (
					// <AuthGuard>
					<TermsOfService />
					// </AuthGuard>
				)}
				options={{ ...commonOptions, title: '이용약관' }}
			/>
			<RootStack.Screen
				name='PrivacyPolicy'
				children={() => (
					// <AuthGuard>
					<PrivacyPolicy />
					// </AuthGuard>
				)}
				options={{ ...commonOptions, title: '개인정보 처리방침' }}
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
