import { StyleSheet, View } from 'react-native';

import { SkeletonBox, SkeletonText } from '@/components/ui/skeleton';
import { Colors } from '@/theme/Color';

const PostDetailSkeleton = () => (
	<View style={styles.container}>
		{/* 헤더: 배지 + 제목 + 작성자/시간 */}
		<View style={styles.header}>
			<SkeletonBox width={45} height={18} style={styles.badge} />
			<SkeletonText lines={1} lineHeight={24} lastLineWidth="80%" />
			<View style={styles.infoContainer}>
				<SkeletonBox width={120} height={14} />
				<SkeletonBox width={60} height={14} />
			</View>
		</View>

		{/* 본문 */}
		<View style={styles.body}>
			<SkeletonText lines={5} lineHeight={20} lastLineWidth="50%" />
		</View>
	</View>
);

const styles = StyleSheet.create({
	container: {
		padding: 24,
		paddingTop: 16,
	},
	header: {
		borderBottomWidth: 1,
		borderColor: Colors.border.default,
		paddingBottom: 16,
		marginBottom: 16,
		gap: 8,
	},
	badge: {
		marginBottom: 4,
	},
	infoContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 4,
	},
	body: {
		borderBottomWidth: 1,
		borderColor: Colors.border.default,
		paddingBottom: 16,
		marginBottom: 16,
	},
});

export default PostDetailSkeleton;
