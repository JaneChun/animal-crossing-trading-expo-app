import { FontAwesome6 } from '@expo/vector-icons';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';

import { FontSizes } from '@/constants/Typography';
import { Colors } from '@/theme/Color';

interface ErrorMessageProps {
	message: string;
	containerStyle?: StyleProp<ViewStyle>;
}

const ErrorMessage = ({ message, containerStyle }: ErrorMessageProps) => {
	if (!message) return null;

	return (
		<View style={[styles.container, containerStyle]}>
			<FontAwesome6 name="circle-exclamation" color="red" size={12} />
			<Text style={styles.text}>{message}</Text>
		</View>
	);
};

export default ErrorMessage;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		marginTop: 6,
	},
	text: {
		color: Colors.badge.red,
		fontSize: FontSizes.xs,
	},
});
