import { Colors } from '@/constants/Color';
import { EditableItemProps } from '@/types/components';
import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const EditableItem = ({ item, onDeleteItem }: EditableItemProps) => {
	return (
		<View style={styles.container}>
			{/* 이미지 */}
			<Image source={{ uri: item.imageUrl }} style={styles.image} />

			{/* 본문 */}
			<View style={styles.body}>
				<View style={styles.title}>
					<Text style={styles.name}>{item.name}</Text>
					{item.color && <Text style={styles.color}>{item.color}</Text>}
				</View>

				<Text style={styles.quantity}>{item.quantity}개</Text>
			</View>

			{/* 테일 */}
			<View style={styles.priceContainer}>
				<Image
					source={{
						uri: 'https://firebasestorage.googleapis.com/v0/b/animal-crossing-trade-app.appspot.com/o/Src%2FMilesTicket.png?alt=media&token=f8e4f60a-1546-4084-9498-0f6f9e765859',
					}}
					style={styles.ticketIcon}
				/>
				<Text style={styles.price}>{item.price}</Text>
			</View>

			<TouchableOpacity
				style={styles.deleteButton}
				onPress={() => onDeleteItem(item.UniqueEntryID)}
			>
				<FontAwesome6 name='circle-minus' size={18} color={Colors.primary} />
			</TouchableOpacity>
		</View>
	);
};

export default EditableItem;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 8,
		paddingHorizontal: 16,
		backgroundColor: Colors.base,
		borderRadius: 10,
		marginBottom: 8,
	},
	image: {
		width: 30,
		height: 30,
		borderRadius: 6,
		marginRight: 8,
	},
	body: {
		flex: 1,
	},
	title: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 4,
	},
	name: {
		fontSize: 16,
		fontWeight: 600,
	},
	color: {
		fontSize: 14,
		color: Colors.font_gray,
		marginLeft: 8,
	},
	quantity: {
		fontSize: 14,
		color: Colors.font_gray,
	},
	priceContainer: {
		flexDirection: 'row',
		gap: 4,
	},
	ticketIcon: {
		width: 20,
		height: 20,
	},
	price: {
		color: Colors.font_gray,
		fontSize: 14,
	},
	deleteButton: {
		marginLeft: 8,
		padding: 6,
		paddingRight: 0,
	},
});
