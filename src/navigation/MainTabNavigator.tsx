import { Entypo, FontAwesome6, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuthStore, useUserInfo } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import { useNotificationStore } from '@/stores/notification';
import { Colors } from '@/theme/Color';

import ChatStackNavigator from './ChatStackNavigator';
import CommunityStackNavigator from './CommunityStackNavigator';
import HomeStackNavigator from './HomeStackNavigator';
import NoticeStackNavigator from './NoticeNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

const MainTab = createBottomTabNavigator();

const getIconColor = (focused: boolean) =>
	focused ? Colors.brand.primary : Colors.text.secondary;

const MainTabNavigator = () => {
	const userInfo = useUserInfo();
	const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
	const unreadChatCount = useChatStore((state) => state.unreadCount);
	const unreadNotificationCount = useNotificationStore((state) => state.unreadCount);

	return (
		<MainTab.Navigator
			screenOptions={{
				popToTopOnBlur: true,
				headerShown: false,
				tabBarStyle: {
					display: isAuthLoading ? 'none' : 'flex',
				},
				tabBarIconStyle: { flex: 1 },
				tabBarActiveTintColor: Colors.brand.primary,
			}}
		>
			<MainTab.Screen
				name="HomeTab"
				component={HomeStackNavigator}
				options={{
					title: '마켓',
					tabBarIcon: ({ focused }) => (
						<Entypo name="home" size={24} color={getIconColor(focused)} />
					),
				}}
			/>
			<MainTab.Screen
				name="CommunityTab"
				component={CommunityStackNavigator}
				options={{
					title: '커뮤니티',
					tabBarIcon: ({ focused }) => (
						<MaterialIcons name="article" size={26} color={getIconColor(focused)} />
					),
				}}
			/>
			<MainTab.Screen
				name="NoticeTab"
				component={NoticeStackNavigator}
				options={{
					title: '알림',
					tabBarIcon: ({ focused }) => (
						<Entypo name="bell" size={24} color={getIconColor(focused)} />
					),
					tabBarBadge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
					tabBarBadgeStyle: {
						marginTop: 8,
					},
				}}
			/>
			<MainTab.Screen
				name="ChatTab"
				component={ChatStackNavigator}
				options={{
					title: '채팅',
					tabBarIcon: ({ focused }) => (
						<MaterialCommunityIcons name="chat" size={24} color={getIconColor(focused)} />
					),
					tabBarBadge: unreadChatCount > 0 ? unreadChatCount : undefined,
					tabBarBadgeStyle: {
						marginTop: 8,
					},
				}}
			/>
			<MainTab.Screen
				name="ProfileTab"
				component={ProfileStackNavigator}
				options={{
					title: userInfo ? '프로필' : '로그인',
					tabBarIcon: ({ focused }) =>
						userInfo ? (
							<FontAwesome6 name="user-large" size={24} color={getIconColor(focused)} />
						) : (
							<Entypo name="login" size={24} color={getIconColor(focused)} />
						),
				}}
			/>
		</MainTab.Navigator>
	);
};

export default MainTabNavigator;
