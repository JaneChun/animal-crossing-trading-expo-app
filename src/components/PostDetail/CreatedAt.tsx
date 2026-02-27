import { StyleSheet, Text, View } from 'react-native';

import { FontSizes } from '@/constants/Typography';
import { Colors } from '@/theme/Color';
import { CreatedAtProps } from '@/types/components';
import { elapsedTime } from '@/utilities/elapsedTime';

const CreatedAt = ({ createdAt, containerStyle }: CreatedAtProps) => {
	return (
		<View style={containerStyle}>
			<Text style={styles.date}>{elapsedTime(createdAt)}</Text>
		</View>
	);
};

export default CreatedAt;

const styles = StyleSheet.create({
	date: {
		color: Colors.text.tertiary,
		fontSize: FontSizes.xs,
	},
});
