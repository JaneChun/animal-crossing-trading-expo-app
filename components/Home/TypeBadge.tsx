import { Colors } from '@/constants/Color';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

type TypeBadgeProps = {
	type: 'buy' | 'sell' | 'done';
};
const TypeBadge = ({ type }: TypeBadgeProps) => {
	return (
		<>
			{type === 'buy' && (
				<Text style={[styles.badge, styles.buyBadge]}>구해요</Text>
			)}
			{type === 'sell' && (
				<Text style={[styles.badge, styles.sellBadge]}>팔아요</Text>
			)}
			{type === 'done' && (
				<Text style={[styles.badge, styles.doneBadge]}>거래완료</Text>
			)}
		</>
	);
};

export default TypeBadge;

const styles = StyleSheet.create({
	badge: {
		marginRight: 6,
		paddingVertical: 4,
		paddingHorizontal: 6,
		fontSize: 14,
		fontWeight: 600,
		borderRadius: 4,
	},
	sellBadge: {
		backgroundColor: Colors.blue_background,
		color: Colors.blue_text,
	},
	buyBadge: {
		backgroundColor: Colors.green_background,
		color: Colors.green_text,
	},
	doneBadge: {
		backgroundColor: Colors.border_gray,
		color: Colors.font_gray,
	},
});
