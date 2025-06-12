import { FontSizes, FontWeights } from '@/constants/Typography';
import { TotalProps } from '@/types/components';
import { CurrencyOption } from '@/types/post';
import { Entypo } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Bell from '../ui/Icons/Bell';
import MileTicket from '../ui/Icons/MileTicket';

const Total = ({ cart = [], containerStyle }: TotalProps) => {
	const { totalBell, totalMileTicket } = cart.reduce(
		(
			acc: { totalBell: number; totalMileTicket: number },
			cur: { quantity: number; price: number; unit: CurrencyOption },
		) => {
			const cost = Number(cur.quantity) * Number(cur.price);
			if (cur.unit === 'bell') {
				acc.totalBell += cost;
			} else {
				acc.totalMileTicket += cost;
			}
			return acc;
		},
		{ totalBell: 0, totalMileTicket: 0 },
	);

	return (
		<View style={[styles.container, containerStyle]}>
			<Text style={styles.totalLabel}>총계</Text>
			{totalBell > 0 && (
				<View style={styles.totalPriceContainer}>
					<Bell style={styles.ticketIcon} />
					<Text style={styles.totalPrice}>{totalBell}</Text>
				</View>
			)}

			{totalBell > 0 && totalMileTicket > 0 && <Entypo name='plus' />}

			{totalMileTicket > 0 && (
				<View style={styles.totalPriceContainer}>
					<MileTicket style={styles.ticketIcon} />
					<Text style={styles.totalPrice}>{totalMileTicket}</Text>
				</View>
			)}
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
		gap: 3,
	},
	totalLabel: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
	},
	totalPriceContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	totalPrice: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
	},
	ticketIcon: {
		width: 20,
		height: 20,
		marginRight: 2,
	},
});
