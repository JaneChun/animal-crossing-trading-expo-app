import { FontAwesome6 } from '@expo/vector-icons';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';

import { Spacing, Theme, useThemedStyles } from '@/theme';

import Text from './Text';

interface ErrorMessageProps {
	message: string;
	containerStyle?: StyleProp<ViewStyle>;
}

const ErrorMessage = ({ message, containerStyle }: ErrorMessageProps) => {
	const styles = useThemedStyles(makeStyles);

	if (!message) return null;

	return (
		<View style={[styles.container, containerStyle]}>
			<FontAwesome6 name="circle-exclamation" color={styles.text.color} size={12} />
			<Text variant="caption" style={styles.text}>
				{message}
			</Text>
		</View>
	);
};

export default ErrorMessage;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.xs,
			marginTop: 6,
		},
		text: {
			color: colors.status.danger,
		},
	});
