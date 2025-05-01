import { useMarkAllAsRead } from '@/hooks/mutation/notification/useMarkAllAsRead';
import { NoticeTabProps } from '@/types/components';
import { PopulatedNotification } from '@/types/notification';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import EmptyIndicator from '../ui/EmptyIndicator';
import NotificationUnit from './NotificationUnit';
import ReadAllButton from './ReadAllButton';

const CommunityNotices = ({ notifications }: NoticeTabProps) => {
	const { mutate: markAllAsRead } = useMarkAllAsRead();

	const renderNotificationItem = ({
		item,
	}: {
		item: PopulatedNotification;
	}) => {
		return <NotificationUnit item={item} collectionName='Communities' />;
	};

	const readAllNotifications = async () => {
		const unReadNotificationIds = notifications
			.filter(({ isRead }) => !isRead)
			.map(({ id }) => id);

		markAllAsRead(unReadNotificationIds);
	};

	return (
		<View style={styles.container}>
			{notifications.length === 0 ? (
				<EmptyIndicator
					iconType='MaterialCommunityIcons'
					iconName='bell-check-outline'
					message='새로운 알림이 없습니다.'
				/>
			) : (
				<>
					<ReadAllButton onPress={readAllNotifications} />
					<FlatList
						data={notifications}
						keyExtractor={({ id }) => id}
						renderItem={renderNotificationItem}
					/>
				</>
			)}
		</View>
	);
};

export default CommunityNotices;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
});
