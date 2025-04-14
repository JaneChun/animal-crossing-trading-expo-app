import { TotalProps } from '@/types/components';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MileTicket from '../ui/MileTicket';

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
				<MileTicket style={styles.ticketIcon} />
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
