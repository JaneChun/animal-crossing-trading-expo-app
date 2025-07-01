import { Colors } from '@/constants/Color';
import { FontSizes } from '@/constants/Typography';
import { ValidationInputProp } from '@/types/components';
import { FontAwesome6 } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, View } from 'react-native';

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
				placeholderTextColor={Colors.font_gray}
				style={[inputStyle, errorMessage ? { borderColor: 'red' } : null]}
			/>
			{errorMessage ? (
				<View
					style={[errorMessageContainerStyle, styles.errorMessageContainer]}
				>
					<FontAwesome6 name='circle-exclamation' color='red' size={12} />
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
		color: Colors.font_gray,
		fontSize: FontSizes.sm,
	},
	errorMessageContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		marginTop: 6,
	},
	errorMessage: {
		color: Colors.badge_red,
		fontSize: FontSizes.xs,
	},
});
