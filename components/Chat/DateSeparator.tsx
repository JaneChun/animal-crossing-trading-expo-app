import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const DateSeparator = ({ date }: { date: string }) => {
	return (
		<View style={styles.container}>
			<View style={styles.line} />
			<Text style={styles.text}>{date}</Text>
			<View style={styles.line} />
		</View>
	);
};

export default DateSeparator;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 8,
		marginHorizontal: 24,
	},
	line: {
		flex: 1,
		height: 0.5,
		backgroundColor: Colors.font_gray,
	},
	text: {
		color: Colors.font_gray,
		fontSize: FontSizes.xs,
		fontWeight: FontWeights.light,
		marginHorizontal: 6,
	},
});
