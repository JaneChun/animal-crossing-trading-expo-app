import { Colors } from '@/constants/Color';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

type BodyProps = {
	body: string;
	containerStyle: ViewStyle;
};
const Body = ({ body, containerStyle }: BodyProps) => {
	return (
		<View style={containerStyle}>
			<Text style={styles.body}>{body}</Text>
		</View>
	);
};

export default Body;

const styles = StyleSheet.create({
	body: {
		fontSize: 16,
		color: Colors.font_gray,
	},
});
