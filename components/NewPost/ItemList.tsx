import { ItemListProps } from '@/types/components';
import { FlatList } from 'react-native-gesture-handler';
import Item from './Item';

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
