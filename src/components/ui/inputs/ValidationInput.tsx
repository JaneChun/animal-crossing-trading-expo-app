import { StyleSheet, TextInput } from 'react-native';

import { FontSizes } from '@/constants/Typography';
import { useTheme } from '@/theme';
import { Colors } from '@/theme/Color';
import { ValidationInputProp } from '@/types/components';

import ErrorMessage from '../ErrorMessage';

const ValidationInput = ({
	inputStyle,
	errorMessageContainerStyle,
	errorMessage,
	InputComponent = TextInput,
	...props
}: ValidationInputProp) => {
	const { colors } = useTheme();

	return (
		<>
			<InputComponent
				{...props}
				placeholderTextColor={Colors.text.tertiary}
				style={[inputStyle, errorMessage ? { borderColor: colors.status.error } : null]}
			/>
			{errorMessage && (
				<ErrorMessage message={errorMessage} containerStyle={errorMessageContainerStyle} />
			)}
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
});
