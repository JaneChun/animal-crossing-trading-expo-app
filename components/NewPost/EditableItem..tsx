import { Colors } from '@/constants/Color';
import { EditableItemProps } from '@/types/components';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ViewStyle,
} from 'react-native';

const EditableItem = ({
	item,
	readonly = false,
	onDeleteItem,
}: EditableItemProps) => {
	const readOnlyContainer: ViewStyle = {
		backgroundColor: Colors.base,
		borderWidth: 0,
	};

	return (
		<View style={[styles.container, readonly && readOnlyContainer]}>
			{/* 이미지 */}
			<Image source={{ uri: item.imageUrl }} style={styles.image} />

			{/* 본문 */}
			<View style={styles.body}>
				<Text style={styles.name} numberOfLines={1} ellipsizeMode='tail'>
					{item.name}
				</Text>
				{item.color && <Text style={styles.color}>{item.color}</Text>}

				<View style={styles.quantityContainer}>
					<Text style={styles.quantity}>{item.price}마일</Text>
					<Ionicons name='close' size={14} color={Colors.font_gray} />
					<Text style={styles.quantity}>{item.quantity}</Text>
				</View>
			</View>

			{/* 테일 */}
			<View style={styles.priceContainer}>
				<Image
					source={{
						uri: 'https://firebasestorage.googleapis.com/v0/b/animal-crossing-trade-app.appspot.com/o/Src%2FMilesTicket.png?alt=media&token=f8e4f60a-1546-4084-9498-0f6f9e765859',
					}}
					style={styles.ticketIcon}
				/>
				<Text style={styles.price}>{item.quantity * item.price}</Text>
			</View>

			{!readonly && onDeleteItem && (
				<TouchableOpacity
					style={styles.deleteButton}
					onPress={() => onDeleteItem(item.UniqueEntryID)}
				>
					<FontAwesome6 name='circle-minus' size={18} color={Colors.primary} />
				</TouchableOpacity>
			)}
		</View>
	);
};

export default EditableItem;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: 'white',
		borderWidth: 1,
		borderColor: Colors.border_gray,
		borderRadius: 10,
		marginBottom: 8,
	},
	body: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'flex-start',
		gap: 4,
	},
	image: {
		width: 30,
		height: 30,
		borderRadius: 6,
		marginRight: 12,
	},
	name: {
		fontSize: 16,
		fontWeight: 600,
	},
	color: {
		fontSize: 14,
		color: Colors.font_gray,
	},
	quantity: {
		fontSize: 14,
		color: Colors.font_gray,
	},
	quantityContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 1,
	},
	priceContainer: {
		flexDirection: 'row',
		gap: 4,
		paddingHorizontal: 4,
	},
	ticketIcon: {
		width: 20,
		height: 20,
	},
	price: {
		color: Colors.font_black,
		fontSize: 14,
	},
	deleteButton: {
		padding: 6,
		paddingRight: 0,
	},
});
