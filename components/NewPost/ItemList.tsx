import type { CartItem } from '@/screens/NewPost';
import { Dispatch, SetStateAction } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import Item from './Item';

type ItemListProps = {
	cart: CartItem[];
	setCart: Dispatch<SetStateAction<CartItem[]>>;
};

const ItemList = ({ cart, setCart }: ItemListProps) => {
	return (
		<FlatList
			data={cart}
			keyExtractor={(item, index) => item.UniqueEntryID ?? index.toString()}
			renderItem={({ item }) => (
				<Item item={item} cart={cart} setCart={setCart} />
			)}
		/>
	);
};

export default ItemList;
