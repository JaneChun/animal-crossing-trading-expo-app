import { StyleSheet, View } from 'react-native';

import { SkeletonBox, SkeletonCircle, SkeletonText } from '@/components/ui/skeleton';

const CommentUnitSkeleton = () => (
	<View style={styles.container}>
		<View style={styles.profileImage}>
			<SkeletonCircle size={50} />
		</View>

		<View style={styles.content}>
			<SkeletonBox width={80} height={16} />
			<SkeletonBox width={120} height={14} style={styles.infoText} />
			<SkeletonText lines={2} lineHeight={24} lastLineWidth="80%" style={styles.body} />
		</View>
	</View>
);

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		paddingTop: 16,
	},
	profileImage: {
		marginRight: 12,
	},
	content: {
		flex: 1,
		paddingBottom: 16,
	},
	infoText: {
		marginTop: 4,
		marginBottom: 6,
	},
	body: {
		marginTop: 4,
	},
});

export default CommentUnitSkeleton;
