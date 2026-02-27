import { StyleSheet, Text, View } from 'react-native';

import { FontSizes } from '@/constants/Typography';
import { Colors } from '@/theme/Color';
import { BodyProps } from '@/types/components';

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
		color: Colors.text.secondary,
		lineHeight: 26,
	},
});
