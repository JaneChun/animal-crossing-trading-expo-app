import { StyleSheet, View } from 'react-native';

import { Theme, useThemedStyles } from '@/theme';

import NotificationUnitSkeleton from './NotificationUnitSkeleton';
import { SkeletonBox } from '../ui/skeleton';

const SKELETON_COUNT = 8;

const NotificationListSkeleton = () => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={styles.container}>
			<View style={styles.buttonContainer}>
				<SkeletonBox width={60} height={16} />
			</View>
			{Array.from({ length: SKELETON_COUNT }).map((_, i) => (
				<NotificationUnitSkeleton key={i} />
			))}
		</View>
	);
};

export default NotificationListSkeleton;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		buttonContainer: {
			padding: 16,
			flexDirection: 'row',
			justifyContent: 'flex-end',
		},
	});
