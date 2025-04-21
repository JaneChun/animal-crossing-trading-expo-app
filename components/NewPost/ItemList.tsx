import EditItemModal from '@/components/NewPost/EditItemModal';
import { ItemListProps } from '@/types/components';
import { CartItem } from '@/types/post';
import { useState } from 'react';
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
	const [isModalVisible, setModalVisible] = useState<boolean>(false);
	const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);

	const updateItemFromCart = (updatedCartItem: CartItem) => {
		setCart((prevCart) =>
			prevCart.map((cartItem) =>
				cartItem.id === updatedCartItem.id ? updatedCartItem : cartItem,
			),
		);
	};

	const deleteItemFromCart = (deleteCartItemId: string) => {
		setCart(cart.filter((cartItem) => cartItem.id !== deleteCartItemId));
	};

	const openEditModal = (item: CartItem) => {
		setSelectedItem(item);
		setModalVisible(true);
	};

	const closeEditModal = () => {
		setSelectedItem(null);
		setModalVisible(false);
	};

	return (
		<View style={containerStyle}>
			<Text style={labelStyle}>아이템 ({cart.length})</Text>

			<FlatList
				data={cart}
				keyExtractor={(item, index) => item.id ?? index.toString()}
				renderItem={({ item }) => (
					<TouchableOpacity onPress={() => openEditModal(item)}>
						<EditableItem item={item} onDeleteItem={deleteItemFromCart} />
					</TouchableOpacity>
				)}
			/>

			<Total cart={cart} containerStyle={{ marginTop: 16 }} />

			{isModalVisible && (
				<EditItemModal
					item={selectedItem}
					isVisible={isModalVisible}
					onUpdate={updateItemFromCart}
					onClose={closeEditModal}
				/>
			)}
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
