import type { CartItem } from '@/screens/NewPost';
import { Dispatch, SetStateAction } from 'react';
import { FlatList } from 'react-native';
import Item from './Item';

type CartItemProps = {
	cart: CartItem[];
	setCart: Dispatch<SetStateAction<CartItem[]>>;
};

const ItemList = ({ cart, setCart }: CartItemProps) => {
	return (
		<FlatList
			data={cart}
			keyExtractor={({ UniqueEntryID }) => UniqueEntryID}
			renderItem={({ item }) => (
				<Item item={item} cart={cart} setCart={setCart} />
			)}
		/>
	);
};

export default ItemList;
