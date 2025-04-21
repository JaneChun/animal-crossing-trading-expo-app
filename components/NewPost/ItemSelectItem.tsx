import { Colors } from '@/constants/Color';
import { ItemSelectItemProps } from '@/types/components';
import { Item } from '@/types/post';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import HighlightMatchText from '../ui/HighlightMatchText';
import ImageWithFallback from '../ui/ImageWithFallback';
import { showToast } from '../ui/Toast';

const ItemSelectItem = ({
	item,
	searchInput,
	cart,
	setCart,
}: ItemSelectItemProps) => {
	const addItemToCart = (item: Item) => {
		const isAlreadyAdded = cart.find((cartItem) => cartItem.id === item.id);

		if (isAlreadyAdded) {
			showToast('warn', '이미 추가된 아이템이에요.', 5);
		} else {
			setCart([...cart, { ...item, quantity: 1, price: 1 }]);
			showToast('success', `${item.name}이(가) 추가되었어요.`, 5);
		}
	};

	return (
		<TouchableOpacity style={styles.item} onPress={() => addItemToCart(item)}>
			<ImageWithFallback
				uri={item?.imageUrl}
				style={styles.itemImage}
				priority='high'
			/>
			<Text
				numberOfLines={1}
				ellipsizeMode='tail'
				style={styles.itemTextContainer}
			>
				{HighlightMatchText({
					text: item.name,
					keyword: searchInput,
					textStyle: {},
					highlightTextStyle: styles.highlight,
				})}
				<Text style={styles.itemColorText}>
					{item.color && ` (${item.color})`}
				</Text>
			</Text>
		</TouchableOpacity>
	);
};

export default ItemSelectItem;

const styles = StyleSheet.create({
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 6,
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
