import { Colors } from '@/constants/Color';
import { CartItem } from '@/screens/NewPost';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

type ItemSummaryListProps = {
	cart: CartItem[];
	containerStyle: ViewStyle;
};

const ItemSummaryList = ({ cart, containerStyle }: ItemSummaryListProps) => {
	return (
		<FlatList
			data={cart}
			keyExtractor={(item, index) => item.UniqueEntryID ?? index.toString()}
			style={containerStyle}
			renderItem={({ item }) => (
				<View style={styles.itemContainer}>
					<View style={styles.itemDetails}>
						<Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
						<Text style={styles.itemName}>{item.name}</Text>
						{item.color && <Text style={styles.itemColor}>{item.color}</Text>}
					</View>
					<View style={styles.itemPriceContainer}>
						<Text style={styles.quantity}>{item.quantity}개</Text>
						<Ionicons name='close' size={14} />
						<Image
							source={{
								uri: 'https://firebasestorage.googleapis.com/v0/b/animal-crossing-trade-app.appspot.com/o/Src%2FMilesTicket.png?alt=media&token=f8e4f60a-1546-4084-9498-0f6f9e765859',
							}}
							style={styles.ticketIcon}
						/>
						<Text>{item.price}</Text>
					</View>
				</View>
			)}
		/>
	);
};

export default ItemSummaryList;

const styles = StyleSheet.create({
	itemContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 8,
		paddingHorizontal: 16,
		backgroundColor: Colors.base,
		borderRadius: 10,
		marginBottom: 8,
	},
	itemDetails: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	itemImage: {
		width: 30,
		height: 30,
		borderRadius: 6,
	},
	itemName: {
		fontSize: 16,
		fontWeight: 600,
		marginLeft: 8,
	},
	itemColor: {
		fontSize: 14,
		color: Colors.font_gray,
		marginLeft: 8,
	},
	itemPriceContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	quantity: {
		fontSize: 14,
		marginRight: 6,
	},
	ticketIcon: {
		width: 20,
		height: 20,
		marginLeft: 6,
		marginRight: 2,
	},
});
