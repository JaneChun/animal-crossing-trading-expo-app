import CommunityNotices from '@/components/Notice/CommunityNotices';
import MarketNotices from '@/components/Notice/MarketNotices';
import TabBarLabel from '@/components/Notice/TabBarLabel';
import Layout from '@/components/ui/Layout';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { Colors } from '@/constants/Color';
import useGetNotifications from '@/hooks/firebase/useGetNotifications';
import { Collection } from '@/types/post';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { StyleSheet } from 'react-native';

const Notice = () => {
	const Tab = createMaterialTopTabNavigator();
	const { notifications, isLoading } = useGetNotifications();

	const marketNotifications = notifications.filter(
		({ type }: { type: Collection }) => type === 'Boards',
	);
	const communityNotifications = notifications.filter(
		({ type }: { type: Collection }) => type === 'Communities',
	);

	const hasUnreadMarket = marketNotifications.some(
		({ isRead }: { isRead: boolean }) => !isRead,
	);
	const hasUnreadCommunity = communityNotifications.some(
		({ isRead }: { isRead: boolean }) => !isRead,
	);

	if (isLoading) {
		return <LoadingIndicator />;
	}

	return (
		<Layout title='알림'>
			<Tab.Navigator
				screenOptions={{
					tabBarLabelStyle: { fontSize: 14, fontWeight: 600 },
					tabBarStyle: {
						backgroundColor: 'white',
					},
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
