import { Colors } from '@/constants/Color';
import { FontSizes } from '@/constants/Typography';
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
		fontSize: FontSizes.md,
		color: Colors.font_dark_gray,
		lineHeight: 26,
	},
});
