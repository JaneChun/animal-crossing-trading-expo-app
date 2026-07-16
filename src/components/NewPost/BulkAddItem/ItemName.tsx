import { StyleSheet, Text, TextStyle } from 'react-native';

import { FontWeights } from '@/constants/Typography';
import { Colors } from '@/theme/Color';
import { type CatalogItem } from '@/types/catalog';
import { getItemDescription } from '@/utilities/catalogItemToItem';

type ItemNameProps = {
	item: CatalogItem;
	nameStyle: TextStyle;
	isDuplicate: boolean;
};

// 찾은 아이템/후보 행에서 공유하는 아이템 이름 + 보조 설명(진품/가품·레시피) 렌더러
const ItemName = ({ item, nameStyle, isDuplicate }: ItemNameProps) => {
	const description = getItemDescription(item);

	return (
		<Text
			style={[nameStyle, isDuplicate && styles.dimmedText]}
			numberOfLines={1}
			ellipsizeMode="tail"
		>
			{item.name}
			{description && (
				<Text style={[styles.itemDescription, isDuplicate && styles.dimmedText]}>
					{` (${description})`}
				</Text>
			)}
		</Text>
	);
};

export default ItemName;

const styles = StyleSheet.create({
	itemDescription: {
		fontWeight: FontWeights.regular,
		color: Colors.text.tertiary,
	},
	dimmedText: {
		color: Colors.text.tertiary,
	},
});
