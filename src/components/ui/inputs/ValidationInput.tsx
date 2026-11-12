import { StyleSheet, TextInput } from 'react-native';

import { FontSizes } from '@/constants/Typography';
import { Spacing, Theme, useTheme } from '@/theme';
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
				placeholderTextColor={colors.text.tertiary}
				style={[inputStyle, errorMessage ? { borderColor: colors.status.error } : null]}
			/>
			{errorMessage && (
				<ErrorMessage message={errorMessage} containerStyle={errorMessageContainerStyle} />
			)}
		</>
	);
};

export default ValidationInput;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		customPlaceHolder: {
			position: 'absolute',
			bottom: Spacing.s,
			lineHeight: 20,
			color: colors.text.tertiary,
			fontSize: FontSizes.sm,
		},
	});
