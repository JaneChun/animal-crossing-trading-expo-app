import { Colors } from '@/constants/Color';
import { FontSizes } from '@/constants/Typography';
import { CreatedAtProps } from '@/types/components';
import { elapsedTime } from '@/utilities/elapsedTime';
import { StyleSheet, Text, View } from 'react-native';

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
		color: Colors.font_gray,
		fontSize: FontSizes.xs,
	},
});
