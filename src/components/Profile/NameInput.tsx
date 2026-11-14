import { useFormContext } from 'react-hook-form';
import { StyleSheet, TextInput, View } from 'react-native';

import ValidationInput from '@/components/ui/inputs/ValidationInput';
import Text from '@/components/ui/Text';
import { ProfileFormValues } from '@/hooks/profile/form/profileFormSchema';
import { FontSizes, Theme, useThemedStyles } from '@/theme';
import { NameInputProp } from '@/types/components';

const NameInput = ({
	type,
	value,
	onChangeText,
	label,
	placeholder,
	InputComponent = TextInput,
}: NameInputProp) => {
	const styles = useThemedStyles(makeStyles);
	const {
		formState: { errors },
	} = useFormContext<ProfileFormValues>();

	const errorMessage = errors?.[type as keyof ProfileFormValues]?.message as string;

	return (
		<View style={styles.inputContainer}>
			<Text variant="body1" weight="semibold" style={styles.label}>
				{label}
			</Text>
			<ValidationInput
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				inputStyle={styles.input}
				errorMessage={errorMessage}
				InputComponent={InputComponent}
				testID={`${type}Input`}
			/>
		</View>
	);
};

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		inputContainer: {
			width: '100%',
			marginBottom: 18,
		},
		label: {
			marginBottom: 16,
		},
		input: {
			fontSize: FontSizes.md,
			color: colors.text.primary,
			paddingHorizontal: 12,
			paddingVertical: 0,
			borderWidth: 1,
			borderColor: colors.bg.fill,
			borderRadius: 8,
			backgroundColor: colors.bg.fill,
			marginBottom: 8,
			textAlignVertical: 'center',
			height: 45,
		},
	});

export default NameInput;
