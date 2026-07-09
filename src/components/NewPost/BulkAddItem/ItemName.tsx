import { StyleSheet, Text, TextStyle } from 'react-native';

import { FontWeights } from '@/constants/Typography';
import { Colors } from '@/theme/Color';
import { type Item } from '@/types/post';

type ItemNameProps = {
	item: Item;
	nameStyle: TextStyle;
	isDuplicate: boolean;
};

// 찾은 아이템/후보 행에서 공유하는 아이템 이름 + 보조 설명(color) 렌더러
const ItemName = ({ item, nameStyle, isDuplicate }: ItemNameProps) => (
	<Text
		style={[nameStyle, isDuplicate && styles.dimmedText]}
		numberOfLines={1}
		ellipsizeMode="tail"
	>
		{item.name}
		{item.color && (
			<Text style={[styles.itemColor, isDuplicate && styles.dimmedText]}>
				{` (${item.color})`}
			</Text>
		)}
	</Text>
);

export default ItemName;

const styles = StyleSheet.create({
	itemColor: {
		fontWeight: FontWeights.regular,
		color: Colors.text.tertiary,
	},
	dimmedText: {
		color: Colors.text.tertiary,
	},
});
