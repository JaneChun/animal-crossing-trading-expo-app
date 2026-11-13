import { TouchableOpacity, View } from 'react-native';

import Total from '@/components/PostDetail/Total';
import Text from '@/components/ui/Text';
import { ItemListProps } from '@/types/components';

import EditableItem from './EditableItem';

const ItemList = ({
	cart,
	handleEditItemPress,
	deleteItemFromCart,
	containerStyle,
	labelStyle,
}: ItemListProps) => {
	return (
		<View style={containerStyle}>
			<Text variant="body1" weight="semibold" style={labelStyle}>
				아이템 ({cart?.length})
			</Text>

			{cart.map((item) => (
				<TouchableOpacity key={item.id} onPress={() => handleEditItemPress(item)}>
					<EditableItem item={item} onDeleteItem={deleteItemFromCart} />
				</TouchableOpacity>
			))}

			<Total cart={cart} containerStyle={{ marginTop: 16 }} />
		</View>
	);
};

export default ItemList;
