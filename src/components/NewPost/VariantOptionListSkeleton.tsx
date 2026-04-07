import { StyleSheet, View } from 'react-native';

import { SkeletonBox } from '@/components/ui/skeleton';

const SKELETON_COUNT = 8;

const VariantOptionItemSkeleton = () => (
	<View style={styles.wrapper}>
		<SkeletonBox style={styles.container} />
	</View>
);

const VariantOptionListSkeleton = () => (
	<View style={styles.listContainer}>
		{Array.from({ length: SKELETON_COUNT }).map((_, i) => (
			<VariantOptionItemSkeleton key={i} />
		))}
	</View>
);

const styles = StyleSheet.create({
	listContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: 16,
		paddingHorizontal: 36,
	},
	wrapper: {
		width: '47%',
		aspectRatio: 1,
	},
	container: {
		flex: 1,
		borderRadius: 20,
	},
});

export default VariantOptionListSkeleton;
