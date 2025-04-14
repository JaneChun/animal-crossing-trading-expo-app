import { Colors } from '@/constants/Color';
import useGetChats from '@/hooks/useGetChats';
import { useAuthStore } from '@/stores/AuthStore';
import { useNotificationCountStore } from '@/stores/NotificationCountStore';
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

const BottomTab = createBottomTabNavigator();

const getTabBarIcon =
	(name: string, IconComponent: any, size = 24) =>
	({ focused }: { focused: boolean }) =>
		(
			<IconComponent
				name={name}
				size={size}
				color={focused ? Colors.primary : Colors.dark_gray}
			/>
		);

const BottomTabNavigator = () => {
	const userInfo = useAuthStore((state) => state.userInfo);
	const { unreadCount: unreadChatCount } = useGetChats();
	const unreadNotificationCount = useNotificationCountStore(
		(state) => state.count,
	);

	return (
		<BottomTab.Navigator
			screenOptions={{
				popToTopOnBlur: true,
				headerShown: false,
				tabBarStyle: {
					height: 60,
				},
				tabBarActiveBackgroundColor: Colors.base,
				tabBarIconStyle: { flex: 1 },
				tabBarLabelStyle: { marginTop: -8 },
				tabBarActiveTintColor: Colors.primary,
			}}
		>
			<BottomTab.Screen
				name='HomeTab'
				component={HomeStackNavigator}
				options={{
					title: '마켓',
					tabBarIcon: getTabBarIcon('home', Entypo),
				}}
			/>
			<BottomTab.Screen
				name='CommunityTab'
				component={CommunityStackNavigator}
				options={{
					title: '커뮤니티',
					tabBarIcon: getTabBarIcon('article', MaterialIcons, 26),
				}}
			/>
			<BottomTab.Screen
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
			<BottomTab.Screen
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
			{/* <BottomTab.Screen
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
			/> */}
			<BottomTab.Screen
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
		</BottomTab.Navigator>
	);
};

export default BottomTabNavigator;
