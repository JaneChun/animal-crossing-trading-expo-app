import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useCallback } from 'react';

import NoticeList from '@/components/Notice/NoticeList';
import TabBarLabel from '@/components/Notice/TabBarLabel';
import Layout from '@/components/ui/layout/Layout';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useNotificationStore } from '@/stores/notification';
import { Colors } from '@/theme/Color';
import { Collection } from '@/types/post';

const Notice = () => {
	const Tab = createMaterialTopTabNavigator();
	const notifications = useNotificationStore((state) => state.notifications);

	const marketNotifications = notifications.filter(
		({ type }: { type: Collection }) => type === 'Boards',
	);
	const communityNotifications = notifications.filter(
		({ type }: { type: Collection }) => type === 'Communities',
	);

	const hasUnreadMarket = marketNotifications.some(({ isRead }: { isRead: boolean }) => !isRead);
	const hasUnreadCommunity = communityNotifications.some(
		({ isRead }: { isRead: boolean }) => !isRead,
	);

	const MarketTab = useCallback(
		() => <NoticeList notifications={marketNotifications} collectionName="Boards" />,
		[marketNotifications],
	);

	const CommunityTab = useCallback(
		() => <NoticeList notifications={communityNotifications} collectionName="Communities" />,
		[communityNotifications],
	);

	return (
		<Layout title="알림">
			<Tab.Navigator
				screenOptions={{
					tabBarLabelStyle: {
						fontSize: FontSizes.sm,
						fontWeight: FontWeights.semibold,
					},
					tabBarStyle: {
						backgroundColor: Colors.bg.primary,
					},
					tabBarIndicatorStyle: { backgroundColor: Colors.brand.primary }, // 선택된 탭 밑줄 색상
					tabBarActiveTintColor: Colors.brand.primary, // 활성 탭 색상
					tabBarInactiveTintColor: Colors.text.tertiary, // 비활성 탭 색상
				}}
			>
				<Tab.Screen
					name="마켓"
					component={MarketTab}
					options={{
						tabBarLabel: () => <TabBarLabel label="마켓" hasUnread={hasUnreadMarket} />,
					}}
				/>
				<Tab.Screen
					name="커뮤니티"
					component={CommunityTab}
					options={{
						tabBarLabel: () => (
							<TabBarLabel label="커뮤니티" hasUnread={hasUnreadCommunity} />
						),
					}}
				/>
			</Tab.Navigator>
		</Layout>
	);
};

export default Notice;
