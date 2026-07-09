import { StyleSheet, Text, View } from 'react-native';

import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { FontSizes, FontWeights, LineHeights } from '@/constants/Typography';
import { BorderRadius } from '@/theme/BorderRadius';
import { Colors } from '@/theme/Color';
import { Spacing } from '@/theme/Spacing';
import { type Item } from '@/types/post';

import ItemName from './ItemName';

type FoundRowProps = {
	item: Item;
	isDuplicate: boolean;
};

// 정확히 하나로 확정된 아이템 행
const FoundRow = ({ item, isDuplicate }: FoundRowProps) => (
	<View style={styles.row} testID={`bulkAddFoundRow-${item.id}`}>
		<ImageWithFallback
			uri={item.imageUrl}
			style={[styles.itemImage, isDuplicate && styles.dimmed]}
		/>
		<ItemName item={item} nameStyle={styles.itemName} isDuplicate={isDuplicate} />
		{isDuplicate && <Text style={[styles.chip, styles.duplicateChip]}>이미 담김</Text>}
	</View>
);

export default FoundRow;

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: 58,
		paddingVertical: Spacing.s,
		paddingHorizontal: Spacing.s,
		borderRadius: BorderRadius.m,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border.default,
	},
	itemImage: {
		width: 40,
		height: 40,
		marginRight: Spacing.m,
		borderRadius: BorderRadius.m,
	},
	itemName: {
		flex: 1,
		fontSize: FontSizes.md,
		fontWeight: FontWeights.medium,
		lineHeight: LineHeights.md,
		color: Colors.text.primary,
		marginRight: Spacing.s,
	},
	chip: {
		fontSize: FontSizes.xxs,
		fontWeight: FontWeights.semibold,
		lineHeight: LineHeights.xxs,
		color: Colors.text.tertiary,
		backgroundColor: Colors.bg.tertiary,
		borderRadius: BorderRadius.full,
		paddingVertical: 3,
		paddingHorizontal: Spacing.s,
		overflow: 'hidden',
	},
	duplicateChip: {
		color: Colors.text.tertiary,
		backgroundColor: Colors.bg.secondary,
	},
	dimmed: {
		opacity: 0.45,
	},
});
