import { Colors } from '@/constants/Color';
import { elapsedTime } from '@/utilities/elapsedTime';
import { Timestamp } from 'firebase/firestore';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

type CreatedAtProps = {
	createdAt: Timestamp;
	containerStyle: ViewStyle;
};

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
	},
});
