import { StyleSheet, View } from 'react-native';

import { SkeletonBox, SkeletonText } from '@/components/ui/skeleton';
import { Colors } from '@/theme/Color';

import { POST_UNIT_HEIGHT } from './PostUnit';

const PostUnitSkeleton = () => (
	<View style={styles.container}>
		<View style={styles.topRow}>
			<View style={styles.typeAndTitle}>
				<SkeletonBox width={40} height={16} />
				<SkeletonText lines={1} lineHeight={20} lastLineWidth="80%" />
			</View>
			<View style={styles.thumbnail}>
				<SkeletonBox width={42} height={42} borderRadius={21} />
			</View>
		</View>

		<View style={styles.bottomRow}>
			<SkeletonBox width={60} height={14} />
			<SkeletonBox width={40} height={14} />
		</View>
	</View>
);

const styles = StyleSheet.create({
	container: {
		height: POST_UNIT_HEIGHT,
		justifyContent: 'center',
		borderBottomWidth: 1,
		borderBottomColor: Colors.border.default,
		borderTopWidth: 1,
		borderTopColor: Colors.border.default,
	},
	topRow: {
		flexDirection: 'row',
		gap: 8,
	},
	typeAndTitle: {
		gap: 6,
		flex: 1,
	},
	thumbnail: {
		flexShrink: 0,
		alignSelf: 'flex-end',
	},
	bottomRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 8,
	},
});

export default PostUnitSkeleton;
