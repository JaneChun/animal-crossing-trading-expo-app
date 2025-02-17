import {
	View,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Keyboard,
} from 'react-native';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Color';

const CommentInput = () => {
	const [commentInput, setCommentInput] = useState<string>('');
	const [keyboardHeight, setKeyboardHeight] = useState(0);

	// 키보드 이벤트 리스너 추가 (키보드 높이 감지)
	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			'keyboardDidShow',
			(event) => {
				setKeyboardHeight(event.endCoordinates.height - 235);
			},
		);
		const keyboardDidHideListener = Keyboard.addListener(
			'keyboardDidHide',
			() => {
				setKeyboardHeight(0);
			},
		);

		return () => {
			keyboardDidShowListener.remove();
			keyboardDidHideListener.remove();
		};
	}, []);

	const onSubmit = () => {
		console.log(commentInput);
	};

	return (
		<View style={[styles.inputContainer, { bottom: keyboardHeight }]}>
			<TextInput
				style={styles.inputText}
				value={commentInput}
				onChangeText={setCommentInput}
				placeholder='댓글을 입력해주세요.'
				multiline
			/>
			<TouchableOpacity style={styles.iconContainer} onPress={onSubmit}>
				<FontAwesome name='send' color={Colors.primary} size={24} />
			</TouchableOpacity>
		</View>
	);
};

export default CommentInput;

const styles = StyleSheet.create({
	inputContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		backgroundColor: 'white',
		flexDirection: 'row',
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
		fontSize: 16,
		color: Colors.font_gray,
	},
	iconContainer: {
		marginRight: 24,
	},
});
