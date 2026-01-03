import { Colors } from '@/constants/Color';
import { ItemSelectItemProps } from '@/types/components';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import HighlightMatchText from '@/components/ui/HighlightMatchText';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

export const ITEM_HEIGHT = 53;

const ItemSelectItem = ({ item, searchInput, addItemToCart, index }: ItemSelectItemProps) => {
	return (
		<TouchableOpacity
			style={styles.item}
			onPress={() => addItemToCart(item)}
			testID={index === 0 ? 'firstItemSelectItem' : `itemSelectItem-${index}`}
		>
			<ImageWithFallback uri={item?.imageUrl} style={styles.itemImage} priority='high' />
			<Text numberOfLines={1} ellipsizeMode='tail' style={styles.itemTextContainer}>
				{HighlightMatchText({
					text: item.name,
					keyword: searchInput,
					textStyle: {},
					highlightTextStyle: styles.highlight,
				})}
				<Text style={styles.itemColorText}>{item.color && ` (${item.color})`}</Text>
			</Text>
		</TouchableOpacity>
	);
};

export default React.memo(ItemSelectItem, (prevProps, nextProps) => {
	return prevProps.item.id === nextProps.item.id && prevProps.searchInput === nextProps.searchInput;
});

const styles = StyleSheet.create({
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 6,
		height: ITEM_HEIGHT,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border_gray,
	},
	itemImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 12,
	},
	itemTextContainer: {
		fontSize: 16,
		flexDirection: 'row',
		flex: 1,
	},
	itemColorText: {
		color: Colors.font_gray,
	},
	highlight: {
		fontWeight: 800,
		color: Colors.primary,
	},
});
