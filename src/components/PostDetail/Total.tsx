import { Entypo } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import Bell from '@/components/ui/Icons/Bell';
import MileTicket from '@/components/ui/Icons/MileTicket';
import Text from '@/components/ui/Text';
import { TotalProps } from '@/types/components';
import { CurrencyOption } from '@/types/post';

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

	if (!totalBell && !totalMileTicket) return null;

	return (
		<View style={[styles.container, containerStyle]}>
			<Text variant="body1" weight="semibold">
				총계
			</Text>
			{totalBell > 0 && (
				<View style={styles.totalPriceContainer}>
					<Bell style={styles.ticketIcon} />
					<Text variant="body1" weight="semibold">
						{totalBell}
					</Text>
				</View>
			)}

			{totalBell > 0 && totalMileTicket > 0 && <Entypo name="plus" />}

			{totalMileTicket > 0 && (
				<View style={styles.totalPriceContainer}>
					<MileTicket style={styles.ticketIcon} />
					<Text variant="body1" weight="semibold">
						{totalMileTicket}
					</Text>
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
	totalPriceContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	ticketIcon: {
		width: 20,
		height: 20,
		marginRight: 2,
	},
});
