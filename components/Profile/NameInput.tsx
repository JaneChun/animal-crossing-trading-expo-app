import { Colors } from '@/constants/Color';
import { NameInputProp } from '@/types/components';
import { StyleSheet, Text, View } from 'react-native';
import ValidationInput from '../ui/ValidationInput';

const NameInput = ({
	label,
	type,
	input,
	setInput,
	placeholder,
	isSubmitted,
}: NameInputProp) => {
	return (
		<View style={styles.inputContainer}>
			<Text style={styles.label}>{label}</Text>
			<ValidationInput
				type={type}
				input={input}
				setInput={setInput}
				placeholder={placeholder}
				inputStyle={styles.input}
				isSubmitted={isSubmitted}
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
		fontSize: 16,
		fontWeight: 600,
		color: Colors.font_black,
		marginBottom: 16,
	},
	input: {
		fontSize: 16,
		padding: 12,
		borderWidth: 1,
		borderColor: Colors.border_gray,
		borderRadius: 8,
		backgroundColor: Colors.base,
		marginBottom: 8,
	},
});

export default NameInput;
