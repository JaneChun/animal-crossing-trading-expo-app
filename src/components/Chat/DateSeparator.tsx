import { StyleSheet, View } from 'react-native';

import Text from '@/components/ui/Text';
import { Theme, useThemedStyles } from '@/theme';

const DateSeparator = ({ date }: { date: string }) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={styles.container}>
			<View style={styles.line} />
			<Text variant="caption" weight="light" color="tertiary" style={styles.text}>
				{date}
			</Text>
			<View style={styles.line} />
		</View>
	);
};

export default DateSeparator;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 8,
		marginHorizontal: 24,
	},
	line: {
		flex: 1,
		height: 0.5,
		backgroundColor: colors.text.tertiary,
	},
	text: {
		marginHorizontal: 6,
	},
});
