import { StyleSheet, View } from 'react-native';

import ImageWithFallback from '@/components/ui/ImageWithFallback';
import Text from '@/components/ui/Text';
import { Theme, useThemedStyles } from '@/theme';
import { BorderRadius } from '@/theme/BorderRadius';
import { Spacing } from '@/theme/Spacing';
import { type CatalogItem } from '@/types/catalog';

import ItemName from './ItemName';

type FoundRowProps = {
	item: CatalogItem;
	isDuplicate: boolean;
};

// 정확히 하나로 확정된 아이템 행
const FoundRow = ({ item, isDuplicate }: FoundRowProps) => {
	const styles = useThemedStyles(makeStyles);

	return (
	<View style={styles.row} testID={`bulkAddFoundRow-${item.id}`}>
		<ImageWithFallback
			uri={item.imageUrl}
			style={[styles.itemImage, isDuplicate && styles.dimmed]}
		/>
		<ItemName
			item={item}
			weight="medium"
			nameStyle={styles.itemName}
			isDuplicate={isDuplicate}
		/>
		{isDuplicate && (
			<Text
				variant="micro"
				weight="semibold"
				color="tertiary"
				style={[styles.chip, styles.duplicateChip]}
			>
				이미 담김
			</Text>
		)}
	</View>
	);
};

export default FoundRow;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: 58,
		paddingVertical: Spacing.s,
		paddingHorizontal: Spacing.s,
		borderRadius: BorderRadius.m,
		borderBottomWidth: 1,
		borderBottomColor: colors.border.default,
	},
	itemImage: {
		width: 40,
		height: 40,
		marginRight: Spacing.m,
		borderRadius: BorderRadius.m,
	},
	itemName: {
		flex: 1,
		marginRight: Spacing.s,
	},
	chip: {
		backgroundColor: colors.bg.tertiary,
		borderRadius: BorderRadius.full,
		paddingVertical: 3,
		paddingHorizontal: Spacing.s,
		overflow: 'hidden',
	},
	duplicateChip: {
		backgroundColor: colors.bg.secondary,
	},
	dimmed: {
		opacity: 0.45,
	},
});
