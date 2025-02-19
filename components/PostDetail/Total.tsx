import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import React from 'react';
import { Colors } from '@/constants/Color';
import { CartItem } from '@/screens/NewPost';

type TotalProps = {
	cart: CartItem[];
	containerStyle: ViewStyle;
};
const Total = ({ cart = [], containerStyle }: TotalProps) => {
	const totalPrice =
		cart.reduce(
			(acc: number, cur: { quantity: number; price: number }) =>
				acc + Number(cur.quantity) * Number(cur.price),
			0,
		) ?? 0;

	return (
		<View style={[styles.container, containerStyle]}>
			<Text style={styles.totalLabel}>일괄</Text>
			<View style={styles.totalPriceContainer}>
				<Image
					source={{
						uri: 'https://firebasestorage.googleapis.com/v0/b/animal-crossing-trade-app.appspot.com/o/Src%2FMilesTicket.png?alt=media&token=f8e4f60a-1546-4084-9498-0f6f9e765859',
					}}
					style={styles.ticketIcon}
				/>
				<Text style={styles.totalPrice}>{totalPrice}</Text>
			</View>
		</View>
	);
};

export default Total;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		paddingRight: 16,
	},
	totalLabel: {
		fontSize: 14,
		fontWeight: 600,
		marginRight: 8,
	},
	totalPriceContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	totalPrice: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	ticketIcon: {
		width: 20,
		height: 20,
		marginLeft: 6,
		marginRight: 2,
	},
});
