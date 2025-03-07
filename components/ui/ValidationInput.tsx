import { Colors } from '@/constants/Color';
import { FontAwesome6 } from '@expo/vector-icons';
import { Dispatch, SetStateAction } from 'react';
import {
	StyleProp,
	StyleSheet,
	Text,
	TextInput,
	TextStyle,
	View,
} from 'react-native';
import { validateInput, VALIDATION_RULES } from '../../utilities/validateInput';

const ValidationInput = ({
	type,
	input,
	setInput,
	placeholder,
	inputStyle,
	multiline = false,
	isSubmitted = false,
}: {
	type: keyof typeof VALIDATION_RULES;
	input: string;
	setInput: Dispatch<SetStateAction<string>>;
	placeholder?: string;
	inputStyle?: StyleProp<TextStyle>;
	multiline?: boolean;
	isSubmitted: boolean;
}) => {
	const errorMessage = isSubmitted ? validateInput(type, input) : '';

	// 유효성 검사 실행 및 상태 업데이트
	const handleTextChange = (text: string) => {
		setInput(text.trim());
	};

	return (
		<>
			<TextInput
				value={input}
				onChangeText={handleTextChange}
				placeholder={placeholder}
				placeholderTextColor={Colors.font_gray}
				style={[inputStyle, errorMessage ? { borderColor: 'red' } : null]}
				multiline={multiline}
			/>
			{errorMessage ? (
				<View style={styles.errorMessageContainer}>
					<FontAwesome6 name='circle-exclamation' color='red' size={12} />
					<Text style={styles.errorMessage}>{errorMessage}</Text>
				</View>
			) : null}
		</>
	);
};

export default ValidationInput;

const styles = StyleSheet.create({
	errorMessageContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		marginTop: 6,
	},
	errorMessage: {
		color: 'red',
		fontSize: 12,
	},
});
