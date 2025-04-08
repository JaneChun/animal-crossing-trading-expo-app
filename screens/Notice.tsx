import CommunityNotices from '@/components/Notice/CommunityNotices';
import MarketNotices from '@/components/Notice/MarketNotices';
import TabBarLabel from '@/components/Notice/TabBarLabel';
import Layout, { PADDING } from '@/components/ui/Layout';
import { Colors } from '@/constants/Color';
import useGetNotifications from '@/hooks/useGetNotifications';
import useLoading from '@/hooks/useLoading';
import { useAuthStore } from '@/stores/AuthStore';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { StyleSheet } from 'react-native';

const Notice = () => {
	const userInfo = useAuthStore((state) => state.userInfo);
	const { notifications, isLoading } = useGetNotifications();
	const { LoadingIndicator } = useLoading();
	const Tab = createMaterialTopTabNavigator();

	const marketNotifications = notifications.filter(
		({ type }) => type === 'Boards',
	);
	const communityNotifications = notifications.filter(
		({ type }) => type === 'Communities',
	);

	const hasUnreadMarket = marketNotifications.some(({ isRead }) => !isRead);
	const hasUnreadCommunity = communityNotifications.some(
		({ isRead }) => !isRead,
	);

	if (isLoading) {
		return <LoadingIndicator />;
	}

	return (
		<Layout title='알림'>
			<Tab.Navigator
				screenOptions={{
					tabBarLabelStyle: { fontSize: 14, fontWeight: 600 },
					tabBarStyle: { backgroundColor: 'white', marginHorizontal: PADDING },
					tabBarIndicatorStyle: { backgroundColor: Colors.primary }, // 선택된 탭 밑줄 색상
					tabBarActiveTintColor: Colors.primary, // 활성 탭 색상
					tabBarInactiveTintColor: Colors.font_gray, // 비활성 탭 색상
				}}
			>
				<Tab.Screen
					name='마켓'
					children={() => <MarketNotices notifications={marketNotifications} />}
					options={{
						tabBarLabel: () => (
							<TabBarLabel label='마켓' hasUnread={hasUnreadMarket} />
						),
					}}
				/>
				<Tab.Screen
					name='커뮤니티'
					children={() => (
						<CommunityNotices notifications={communityNotifications} />
					)}
					options={{
						tabBarLabel: () => (
							<TabBarLabel label='커뮤니티' hasUnread={hasUnreadCommunity} />
						),
					}}
				/>
			</Tab.Navigator>
		</Layout>
	);
};

const styles = StyleSheet.create({});

export default Notice;
