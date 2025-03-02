import { ItemListProps } from '@/types/components';
import { CartItem } from '@/types/post';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Total from '../PostDetail/Total';
import EditableItem from './EditableItem.';

const ItemList = ({
	cart,
	setCart,
	containerStyle,
	labelStyle,
}: ItemListProps) => {
	// CartItem 메서드
	// const updateItem = (updatedCartItem: CartItem) => {
	// 	setCart((prevCart) =>
	// 		prevCart.map((cartItem) =>
	// 			cartItem.UniqueEntryID === updatedCartItem.UniqueEntryID
	// 				? updatedCartItem
	// 				: cartItem,
	// 		),
	// 	);
	// };

	const deleteItemFromCart = (deleteCartItemId: string) => {
		setCart(
			cart.filter((cartItem) => cartItem.UniqueEntryID !== deleteCartItemId),
		);
	};

	const onEditItem = (item: CartItem) => {
		console.log(item.UniqueEntryID);
	};

	return (
		<View style={containerStyle}>
			<Text style={labelStyle}>아이템 목록 ({cart.length})</Text>

			<FlatList
				data={cart}
				keyExtractor={(item, index) => item.UniqueEntryID ?? index.toString()}
				renderItem={({ item }) => (
					<TouchableOpacity onPress={() => onEditItem(item)}>
						<EditableItem item={item} onDeleteItem={deleteItemFromCart} />
					</TouchableOpacity>
				)}
			/>

			<Total cart={cart} containerStyle={{ marginTop: 16 }} />
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
