import { ItemListProps } from '@/types/components';
import { Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Total from '../PostDetail/Total';
import EditableItem from './EditableItem.';

const ItemList = ({
	cart,
	handleEditItemPress,
	deleteItemFromCart,
	containerStyle,
	labelStyle,
}: ItemListProps) => {
	return (
		<View style={containerStyle}>
			<Text style={labelStyle}>아이템 ({cart?.length})</Text>

			<FlatList
				data={cart}
				keyExtractor={(item, index) => item.id ?? index.toString()}
				renderItem={({ item }) => (
					<TouchableOpacity onPress={() => handleEditItemPress(item)}>
						<EditableItem item={item} onDeleteItem={deleteItemFromCart} />
					</TouchableOpacity>
				)}
			/>

			<Total cart={cart} containerStyle={{ marginTop: 16 }} />
		</View>
	);
};

export default ItemList;
