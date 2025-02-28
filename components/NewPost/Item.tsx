import { Colors } from '@/constants/Color';
import { CartItemProps } from '@/types/components';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
	Image,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

const Item = ({ item, updateItem, deleteItemFromCart }: CartItemProps) => {
	const [quantityInput, setQuantityInput] = useState<number>(
		item.quantity || 1,
	);
	const [milesTicketInput, setMilesTicketInput] = useState<number>(
		item.price || 1,
	);

	const onQuantityDecrement = () => {
		if (quantityInput === 1) {
			deleteItemFromCart(item.UniqueEntryID);
			return;
		}

		const newQuantity = quantityInput - 1;
		setQuantityInput(newQuantity);
		updateItem({ ...item, quantity: newQuantity });
	};

	const onQuantityIncrement = () => {
		const newQuantity = quantityInput + 1;
		setQuantityInput(newQuantity);
		updateItem({ ...item, quantity: newQuantity });
	};

	const onMilesTicketDecrement = () => {
		const newPrice = Math.max(milesTicketInput - 1, 0);
		setMilesTicketInput(newPrice);
		updateItem({ ...item, price: newPrice });
	};

	const onMilesTicketIncrement = () => {
		const newPrice = milesTicketInput + 1;
		setMilesTicketInput(newPrice);
		updateItem({ ...item, price: newPrice });
	};

	// 개별 아이템 총계 계산 (수량 × 가격)
	const itemTotal = quantityInput * milesTicketInput;

	return (
		<View style={styles.container}>
			{/* 이미지 카드 */}
			<View style={styles.imageContainer}>
				<TouchableOpacity
					onPress={deleteItemFromCart}
					style={styles.deleteButton}
				>
					<Ionicons name='close' color={Colors.font_gray} size={16} />
				</TouchableOpacity>
				<Image source={{ uri: item.imageUrl }} style={styles.image} />
				<Text style={styles.itemName}>{item.name}</Text>
				{item.color && <Text style={styles.itemColor}>{item.color}</Text>}
			</View>

			<View style={styles.infoContainer}>
				{/* 수량 카운터 */}
				<View style={styles.counterContainer}>
					<Text style={styles.counterHeader}>수량</Text>
					<TouchableOpacity
						onPress={onQuantityIncrement}
						style={styles.counterButton}
					>
						<AntDesign name='caretup' color={Colors.primary} />
					</TouchableOpacity>
					<TextInput
						style={styles.counterInput}
						value={String(quantityInput)}
						// 수량 편집 가능
					/>
					<TouchableOpacity
						onPress={onQuantityDecrement}
						style={styles.counterButton}
					>
						<AntDesign name='caretdown' color={Colors.primary} />
					</TouchableOpacity>
				</View>

				{/* 마일티켓 카운터 */}
				<View style={styles.counterContainer}>
					<Text style={styles.counterHeader}>마일티켓</Text>
					<TouchableOpacity
						onPress={onMilesTicketIncrement}
						style={styles.counterButton}
					>
						<AntDesign name='caretup' color={Colors.primary} />
					</TouchableOpacity>
					<TextInput
						style={styles.counterInput}
						value={String(milesTicketInput)}
						editable={false}
					/>

					<TouchableOpacity
						onPress={onMilesTicketDecrement}
						style={styles.counterButton}
					>
						<AntDesign name='caretdown' color={Colors.primary} />
					</TouchableOpacity>
				</View>

				{/* 총계 (수량 × 가격) */}
				<View style={styles.totalContainer}>
					<View style={styles.counterHeader} />
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Image
							source={{
								uri: 'https://firebasestorage.googleapis.com/v0/b/animal-crossing-trade-app.appspot.com/o/Src%2FMilesTicket.png?alt=media&token=f8e4f60a-1546-4084-9498-0f6f9e765859',
							}}
							style={[styles.ticketImage, { marginRight: 6 }]}
						/>
						<Text style={styles.totalText}>
							{itemTotal.toLocaleString()}마일
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
};

export default Item;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 10,
	},
	imageContainer: {
		position: 'relative',
		width: 130,
		height: 130,
		backgroundColor: 'white',
		borderWidth: 1,
		borderColor: Colors.border_gray,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
	},
	image: {
		width: 60,
		height: 60,
		borderRadius: 5,
	},
	itemName: {
		textAlign: 'center',
		fontSize: 14,
		marginTop: 5,
	},
	itemColor: {
		fontSize: 12,
		color: Colors.font_gray,
		marginTop: 5,
	},
	deleteButton: {
		position: 'absolute',
		zIndex: 2,
		top: 6,
		right: 6,
		borderRadius: 12,
		width: 20,
		height: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	infoContainer: {
		marginTop: 10,
		flexDirection: 'row',
		alignItems: 'center',
	},
	counterContainer: {
		alignItems: 'center',
	},
	counterButton: {
		width: '100%',
		height: 30,
		justifyContent: 'center',
		alignItems: 'center',
	},
	counterInput: {
		width: 50,
		height: 30,
		marginHorizontal: 10,
		textAlign: 'center',
		borderWidth: 1,
		borderColor: Colors.border_gray,
		borderRadius: 5,
		backgroundColor: Colors.base,
	},
	ticketImage: {
		width: 20,
		height: 20,
	},
	counterHeader: {
		height: 20,
		alignItems: 'center',
		color: Colors.font_gray,
	},
	totalContainer: {
		alignSelf: 'center',
	},
	totalText: {
		fontSize: 16,
		color: Colors.font_black,
	},
});
