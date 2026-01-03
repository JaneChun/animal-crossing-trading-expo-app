import { useMarkAllAsRead } from '@/hooks/notification/query/mutation/useMarkAllAsRead';
import { useNotificationStore } from '@/stores/notification';
import { NoticeTabProps } from '@/types/components';
import { PopulatedNotification } from '@/types/notification';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import NotificationUnit from './NotificationUnit';
import ReadAllButton from './ReadAllButton';

const CommunityNotices = ({ notifications }: NoticeTabProps) => {
	const { mutate: markAllAsRead } = useMarkAllAsRead();
	const isLoading = useNotificationStore((state) => state.isLoading);

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

	if (isLoading) {
		return <LoadingIndicator />;
	}

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
