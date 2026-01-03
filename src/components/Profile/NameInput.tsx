import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { ProfileFormValues } from '@/hooks/form/Profile/profileFormSchema';
import { NameInputProp } from '@/types/components';
import { useFormContext } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import ValidationInput from '@/components/ui/inputs/ValidationInput';

const NameInput = ({
	type,
	value,
	onChangeText,
	label,
	placeholder,
	InputComponent = TextInput,
}: NameInputProp) => {
	const {
		formState: { errors },
	} = useFormContext();

	const errorMessage = errors?.[type as keyof ProfileFormValues]
		?.message as string;

	return (
		<View style={styles.inputContainer}>
			<Text style={styles.label}>{label}</Text>
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

const styles = StyleSheet.create({
	inputContainer: {
		width: '100%',
		marginBottom: 24,
	},
	label: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
		color: Colors.font_black,
		marginBottom: 16,
	},
	input: {
		fontSize: FontSizes.md,
		padding: 12,
		borderWidth: 1,
		borderColor: Colors.base,
		borderRadius: 8,
		backgroundColor: Colors.base,
		marginBottom: 8,
		textAlignVertical: 'center',
		height: 45,
	},
});

export default NameInput;
