import { StyleSheet, Text, View } from 'react-native';

import { FontSizes, FontWeights } from '@/constants/Typography';
import { Colors } from '@/theme/Color';

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
		backgroundColor: Colors.text.tertiary,
	},
	text: {
		color: Colors.text.tertiary,
		fontSize: FontSizes.xs,
		fontWeight: FontWeights.light,
		marginHorizontal: 6,
	},
});
