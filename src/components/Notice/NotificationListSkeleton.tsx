import { StyleSheet, View } from 'react-native';

import { Colors } from '@/theme/Color';

import NotificationUnitSkeleton from './NotificationUnitSkeleton';
import { SkeletonBox } from '../ui/skeleton';

const SKELETON_COUNT = 8;

const NotificationListSkeleton = () => (
	<View style={styles.container}>
		<View style={styles.buttonContainer}>
			<SkeletonBox width={60} height={16} />
		</View>
		{Array.from({ length: SKELETON_COUNT }).map((_, i) => (
			<NotificationUnitSkeleton key={i} />
		))}
	</View>
);

export default NotificationListSkeleton;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.bg.primary,
	},
	buttonContainer: {
		padding: 16,
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
});
