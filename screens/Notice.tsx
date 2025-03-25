import CommunityNotices from '@/components/Notice/CommunityNotices';
import MarketNotices from '@/components/Notice/MarketNotices';
import Layout from '@/components/ui/Layout';
import { Colors } from '@/constants/Color';
import { useAuthContext } from '@/contexts/AuthContext';
import useGetChats from '@/hooks/useGetChats';
import useLoading from '@/hooks/useLoading';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { StyleSheet } from 'react-native';

const Notice = () => {
	const { userInfo } = useAuthContext();
	const { chats, isLoading } = useGetChats();
	const { LoadingIndicator } = useLoading();
	const Tab = createMaterialTopTabNavigator();

	if (isLoading) {
		return <LoadingIndicator />;
	}

	return (
		<Layout title='알림'>
			<Tab.Navigator
				screenOptions={{
					tabBarLabelStyle: { fontSize: 14, fontWeight: 600 },
					tabBarStyle: { backgroundColor: 'white' },
					tabBarIndicatorStyle: { backgroundColor: Colors.primary }, // 선택된 탭 밑줄 색상
					tabBarActiveTintColor: Colors.primary, // 활성 탭 색상
					tabBarInactiveTintColor: Colors.font_gray, // 비활성 탭 색상
				}}
			>
				<Tab.Screen name='마켓' component={MarketNotices} />
				<Tab.Screen name='커뮤니티' component={CommunityNotices} />
			</Tab.Navigator>
		</Layout>
	);
};

const styles = StyleSheet.create({
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyText: {
		fontSize: 14,
		color: Colors.font_gray,
	},
});

export default Notice;
