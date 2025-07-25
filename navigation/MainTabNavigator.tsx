import { Colors } from '@/constants/Color';
import { useAuthStore, useUserInfo } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import { useNotificationStore } from '@/stores/notification';
import {
	Entypo,
	FontAwesome6,
	MaterialCommunityIcons,
	MaterialIcons,
} from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChatStackNavigator from './ChatStackNavigator';
import CommunityStackNavigator from './CommunityStackNavigator';
import HomeStackNavigator from './HomeStackNavigator';
import NoticeStackNavigator from './NoticeNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

const MainTab = createBottomTabNavigator();

const getTabBarIcon =
	(name: string, IconComponent: any, size = 24) =>
	({ focused }: { focused: boolean }) =>
		(
			<IconComponent
				name={name}
				size={size}
				color={focused ? Colors.primary : Colors.font_dark_gray}
			/>
		);

const MainTabNavigator = () => {
	const userInfo = useUserInfo();
	const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
	const unreadChatCount = useChatStore((state) => state.unreadCount);
	const unreadNotificationCount = useNotificationStore(
		(state) => state.unreadCount,
	);

	return (
		<MainTab.Navigator
			screenOptions={{
				popToTopOnBlur: true,
				headerShown: false,
				tabBarStyle: {
					display: isAuthLoading ? 'none' : 'flex',
				},
				tabBarIconStyle: { flex: 1 },
				tabBarActiveTintColor: Colors.primary,
			}}
		>
			<MainTab.Screen
				name='HomeTab'
				component={HomeStackNavigator}
				options={{
					title: '마켓',
					tabBarIcon: getTabBarIcon('home', Entypo),
				}}
			/>
			<MainTab.Screen
				name='CommunityTab'
				component={CommunityStackNavigator}
				options={{
					title: '커뮤니티',
					tabBarIcon: getTabBarIcon('article', MaterialIcons, 26),
				}}
			/>
			<MainTab.Screen
				name='NoticeTab'
				component={NoticeStackNavigator}
				options={{
					title: '알림',
					tabBarIcon: getTabBarIcon('bell', Entypo),
					tabBarBadge:
						unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
					tabBarBadgeStyle: {
						marginTop: 8,
					},
				}}
			/>
			<MainTab.Screen
				name='ChatTab'
				component={ChatStackNavigator}
				options={{
					title: '채팅',
					tabBarIcon: getTabBarIcon('chat', MaterialCommunityIcons),
					tabBarBadge: unreadChatCount > 0 ? unreadChatCount : undefined,
					tabBarBadgeStyle: {
						marginTop: 8,
					},
				}}
			/>
			<MainTab.Screen
				name='ProfileTab'
				component={ProfileStackNavigator}
				options={{
					title: userInfo ? '프로필' : '로그인',
					tabBarIcon: getTabBarIcon(
						userInfo ? 'user-large' : 'login',
						userInfo ? FontAwesome6 : Entypo,
					),
				}}
			/>
		</MainTab.Navigator>
	);
};

export default MainTabNavigator;
