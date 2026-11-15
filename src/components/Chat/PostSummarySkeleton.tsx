import { StyleSheet, View } from 'react-native';

import { SkeletonBox, SkeletonCircle } from '@/components/ui/skeleton';
import { Theme, useThemedStyles } from '@/theme';

const PostSummarySkeleton = () => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={styles.container}>
			<SkeletonBox width={50} height={50} borderRadius={6} />
			<View style={styles.titleContainer}>
				<SkeletonBox width={40} height={20} />
				<SkeletonBox width="60%" height={18} />
			</View>
			<SkeletonCircle size={24} />
		</View>
	);
};

export default PostSummarySkeleton;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingHorizontal: 16,
			height: 70,
			backgroundColor: colors.bg.raised,
			borderRadius: 8,
		},
		titleContainer: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			marginHorizontal: 12,
		},
	});
