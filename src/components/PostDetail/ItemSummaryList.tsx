import { ItemSummaryListProps } from '@/types/components';
import { FlatList } from 'react-native-gesture-handler';
import EditableItem from '../NewPost/EditableItem.';

const ItemSummaryList = ({ cart, containerStyle }: ItemSummaryListProps) => {
	return (
		<FlatList
			data={cart}
			keyExtractor={(item) => item.id}
			style={containerStyle}
			renderItem={({ item }) => <EditableItem item={item} readonly />}
		/>
	);
};

export default ItemSummaryList;
