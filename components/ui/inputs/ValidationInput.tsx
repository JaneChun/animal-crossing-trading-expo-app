import { Colors } from '@/constants/Color';
import { FontSizes } from '@/constants/Typography';
import { ValidationInputProp } from '@/types/components';
import { FontAwesome6 } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { validateInput } from '../../../utilities/validateInput';

const ValidationInput = ({
	type,
	input,
	setInput,
	placeholder,
	inputStyle,
	multiline = false,
	isSubmitted = false,
}: ValidationInputProp) => {
	const errorMessage = isSubmitted ? validateInput(type, input) : '';

	// 유효성 검사 실행 및 상태 업데이트
	const handleTextChange = (text: string) => {
		setInput(text);
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
				<View
					style={[
						styles.errorMessageContainer,
						(type === 'postTitle' || type === 'postBody') && {
							marginTop: 0,
							marginBottom: 8,
						},
					]}
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
