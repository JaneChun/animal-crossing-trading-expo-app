import { ItemListProps } from '@/types/components';
import { Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Item from './Item';

const ItemList = ({
	cart,
	setCart,
	containerStyle,
	labelStyle,
}: ItemListProps) => {
	return (
		<View style={containerStyle}>
			<Text style={labelStyle}>아이템 목록</Text>

			<FlatList
				data={cart}
				keyExtractor={(item, index) => item.UniqueEntryID ?? index.toString()}
				renderItem={({ item }) => (
					<Item item={item} cart={cart} setCart={setCart} />
				)}
			/>
		</View>
	);
};

export default ItemList;
