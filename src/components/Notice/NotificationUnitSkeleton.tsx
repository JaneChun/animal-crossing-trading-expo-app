import { StyleSheet, View } from 'react-native';

import { SkeletonBox } from '@/components/ui/skeleton';
import { Colors } from '@/theme/Color';

const NotificationUnitSkeleton = () => (
	<View style={styles.container}>
		<View style={styles.content}>
			<SkeletonBox width="80%" height={20} />
			<SkeletonBox width="100%" height={18} style={styles.body} />
			<SkeletonBox width={80} height={14} style={styles.date} />
		</View>
	</View>
);

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		paddingHorizontal: 24,
		paddingVertical: 12,
		backgroundColor: Colors.bg.primary,
		borderBottomWidth: 1,
		borderColor: Colors.border.default,
	},
	content: {
		flex: 1,
	},
	body: {
		marginTop: 4,
	},
	date: {
		marginTop: 6,
		alignSelf: 'flex-end',
	},
});

export default NotificationUnitSkeleton;
