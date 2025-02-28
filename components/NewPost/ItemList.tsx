import { ItemListProps } from '@/types/components';
import { CartItem } from '@/types/post';
import { StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Item from './Item';

const ItemList = ({
	cart,
	setCart,
	containerStyle,
	labelStyle,
}: ItemListProps) => {
	const updateItem = (updatedCartItem: CartItem) => {
		setCart((prevCart) =>
			prevCart.map((cartItem) =>
				cartItem.UniqueEntryID === updatedCartItem.UniqueEntryID
					? updatedCartItem
					: cartItem,
			),
		);
	};

	const deleteItemFromCart = (deleteCartItemId: string) => {
		setCart(
			cart.filter((cartItem) => cartItem.UniqueEntryID !== deleteCartItemId),
		);
	};

	return (
		<View style={containerStyle}>
			<Text style={labelStyle}>아이템 목록 ({cart.length})</Text>

			<FlatList
				data={cart}
				keyExtractor={(item, index) => item.UniqueEntryID ?? index.toString()}
				renderItem={({ item }) => (
					<Item
						item={item}
						updateItem={updateItem}
						deleteItemFromCart={deleteItemFromCart}
					/>
				)}
			/>
		</View>
	);
};

export default ItemList;

const styles = StyleSheet.create({
	labelContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
});
