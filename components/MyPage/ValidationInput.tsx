import { Colors } from '@/constants/Color';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type ValidationInputProps = {
	label: string;
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
};

const ValidationInput = ({
	label,
	value,
	onChangeText,
	placeholder,
}: ValidationInputProps) => {
	const [errorMessage, setErrorMessage] = useState<string>('');

	// 유효성 검사 함수
	const validateInput = (text: string) => {
		if (text.trim() === '') {
			return `${label}을 입력해주세요!`;
		}
		if (text.length > 10) {
			return `${label}은 10자 이하로 입력해주세요.`;
		}
		if (!/^[a-zA-Z0-9가-힣]+$/.test(text)) {
			return `${label}은 띄어쓰기 없이 한글, 영문, 숫자만 가능해요.`;
		}
		return '';
	};

	// 입력 값 변경 시 유효성 검사 실행
	const handleTextChange = (text: string) => {
		setErrorMessage(validateInput(text));
		onChangeText(text);
	};

	return (
		<View style={styles.inputContainer}>
			<Text style={styles.label}>{label}</Text>
			<TextInput
				value={value}
				onChangeText={handleTextChange}
				placeholder={placeholder}
				placeholderTextColor={Colors.font_gray}
				style={[styles.input, errorMessage ? styles.inputError : null]}
			/>
			{errorMessage ? (
				<Text style={styles.errorText}>{errorMessage}</Text>
			) : null}
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
	inputError: {
		// borderColor: 'red',
	},
	errorText: {
		color: 'red',
		fontSize: 12,
		marginTop: 4,
	},
});

export default ValidationInput;
