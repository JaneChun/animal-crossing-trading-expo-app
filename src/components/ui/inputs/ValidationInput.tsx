import { FontAwesome6 } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { FontSizes } from '@/constants/Typography';
import { Colors } from '@/theme/Color';
import { ValidationInputProp } from '@/types/components';

const ValidationInput = ({
	inputStyle,
	errorMessageContainerStyle,
	errorMessage,
	InputComponent = TextInput,
	...props
}: ValidationInputProp) => {
	return (
		<>
			<InputComponent
				{...props}
				placeholderTextColor={Colors.text.tertiary}
				style={[inputStyle, errorMessage ? { borderColor: 'red' } : null]}
			/>
			{errorMessage ? (
				<View style={[errorMessageContainerStyle, styles.errorMessageContainer]}>
					<FontAwesome6 name="circle-exclamation" color="red" size={12} />
					<Text style={styles.errorMessage}>{errorMessage}</Text>
				</View>
			) : null}
		</>
	);
};

export default ValidationInput;

const styles = StyleSheet.create({
	customPlaceHolder: {
		position: 'absolute',
		bottom: 8,
		lineHeight: 20,
		color: Colors.text.tertiary,
		fontSize: FontSizes.sm,
	},
	errorMessageContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		marginTop: 6,
	},
	errorMessage: {
		color: Colors.badge.red,
		fontSize: FontSizes.xs,
	},
});
