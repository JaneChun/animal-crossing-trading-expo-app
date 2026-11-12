import { StyleSheet, TextStyle } from 'react-native';

import Text from '@/components/ui/Text';
import { FontWeights, Theme, useThemedStyles } from '@/theme';
import { type CatalogItem } from '@/types/catalog';
import { getCatalogItemDescription } from '@/utilities/catalogItemToItem';

type ItemNameProps = {
	item: CatalogItem;
	weight: keyof typeof FontWeights;
	nameStyle: TextStyle;
	isDuplicate: boolean;
};

// 찾은 아이템/후보 행에서 공유하는 아이템 이름 + 보조 설명(진품/가품·레시피) 렌더러
const ItemName = ({ item, weight, nameStyle, isDuplicate }: ItemNameProps) => {
	const styles = useThemedStyles(makeStyles);
	const description = getCatalogItemDescription(item);

	return (
		<Text
			variant="body1"
			weight={weight}
			style={[nameStyle, isDuplicate && styles.dimmedText]}
			numberOfLines={1}
			ellipsizeMode="tail"
		>
			{item.name}
			{description && (
				<Text weight="regular" color="tertiary">
					{` (${description})`}
				</Text>
			)}
		</Text>
	);
};

export default ItemName;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		dimmedText: {
			color: colors.text.tertiary,
		},
	});
