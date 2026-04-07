import { StyleSheet, View } from 'react-native';

import { SkeletonBox } from '@/components/ui/skeleton';
import { Colors } from '@/theme';

import { ITEM_HEIGHT } from './ItemSelectItem';

const SKELETON_COUNT = 15;

const ItemSelectItemSkeleton = () => (
	<View style={styles.item}>
		<SkeletonBox width={40} height={40} borderRadius={12} style={styles.image} />
		<SkeletonBox width="70%" height={18} />
	</View>
);

const ItemSelectSkeleton = () => (
	<View style={styles.listContainer}>
		{Array.from({ length: SKELETON_COUNT }).map((_, i) => (
			<ItemSelectItemSkeleton key={i} />
		))}
	</View>
);

const styles = StyleSheet.create({
	listContainer: {
		marginTop: 16,
	},
	item: {
		paddingHorizontal: 24,
		height: ITEM_HEIGHT,
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderBottomColor: Colors.border.default,
	},
	image: {
		marginRight: 12,
	},
});

export default ItemSelectSkeleton;
