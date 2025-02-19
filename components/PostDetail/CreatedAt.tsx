import { Colors } from '@/constants/Color';
import { elapsedTime } from '@/utilities/elapsedTime';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

type CreatedAtProps = {
	createdAt: any;
	containerStyle: ViewStyle;
};

const CreatedAt = ({ createdAt, containerStyle }: CreatedAtProps) => {
	return (
		<View style={containerStyle}>
			<Text style={styles.date}>{elapsedTime(createdAt?.toDate())}</Text>
		</View>
	);
};

export default CreatedAt;

const styles = StyleSheet.create({
	date: {
		color: Colors.font_gray,
	},
});
