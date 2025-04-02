import { Colors } from '@/constants/Color';
import { NoticeTabProps } from '@/types/components';
import { NotificationWithReceiverInfo } from '@/types/notification';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import NotificationUnit from './NotificationUnit';

const MarketNotices = ({ notifications }: NoticeTabProps) => {
	const renderNotificationItem = ({
		item,
	}: {
		item: NotificationWithReceiverInfo;
	}) => {
		return <NotificationUnit item={item} tab='Market' />;
	};

	return (
		<View style={styles.container}>
			{notifications.length === 0 ? (
				<View style={styles.emptyContainer}>
					<MaterialCommunityIcons
						name='bell-check-outline'
						color={Colors.font_light_gray}
						size={72}
						style={styles.emptyIcon}
					/>
					<Text style={styles.emptyText}>새로운 알림이 없습니다.</Text>
				</View>
			) : (
				<FlatList
					data={notifications}
					keyExtractor={({ id }) => id}
					renderItem={renderNotificationItem}
				/>
			)}
		</View>
	);
};

export default MarketNotices;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	emptyContainer: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyIcon: {
		marginBottom: 16,
	},
	emptyText: {
		fontSize: 14,
		color: Colors.font_gray,
	},
});
