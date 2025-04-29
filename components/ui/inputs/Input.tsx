import { Colors } from '@/constants/Color';
import { FontSizes } from '@/constants/Typography';
import { InputProps } from '@/types/components';
import { FontAwesome6 } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';

const Input = ({
	input,
	setInput,
	onPress,
	placeholder,
	marginBottom,
}: InputProps) => {
	const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);

	// 키보드 이벤트 리스너 추가 (키보드 감지)
	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			'keyboardDidShow',
			() => {
				setIsKeyboardVisible(true);
			},
		);
		const keyboardDidHideListener = Keyboard.addListener(
			'keyboardDidHide',
			() => {
				setIsKeyboardVisible(false);
			},
		);

		return () => {
			keyboardDidShowListener.remove();
			keyboardDidHideListener.remove();
		};
	}, []);

	return (
		<View
			style={[
				styles.inputContainer,
				isKeyboardVisible && { marginBottom: marginBottom ? marginBottom : 58 },
			]}
		>
			<TextInput
				style={styles.inputText}
				value={input}
				onChangeText={setInput}
				placeholder={placeholder}
				multiline
				enterKeyHint='send'
			/>
			<Pressable style={styles.iconContainer} onPress={onPress}>
				<FontAwesome6 name='circle-arrow-up' size={28} color={Colors.primary} />
			</Pressable>
		</View>
	);
};

export default Input;

const styles = StyleSheet.create({
	inputContainer: {
		flexDirection: 'row',
		backgroundColor: 'white',
		alignItems: 'center',
		borderTopWidth: 1,
		borderColor: Colors.border_gray,
	},
	inputText: {
		flex: 1,
		borderWidth: 1,
		borderColor: Colors.border_gray,
		backgroundColor: Colors.base,
		borderRadius: 20,
		paddingVertical: 10,
		paddingHorizontal: 16,
		margin: 8,
		fontSize: FontSizes.md,
		color: Colors.font_gray,
	},
	iconContainer: {
		marginRight: 16,
	},
});
