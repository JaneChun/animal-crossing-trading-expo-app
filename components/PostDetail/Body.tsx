import { Colors } from '@/constants/Color';
import { BodyProps } from '@/types/components';
import { StyleSheet, Text, View } from 'react-native';

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
