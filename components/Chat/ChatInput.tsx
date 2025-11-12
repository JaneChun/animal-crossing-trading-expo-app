import { Colors } from '@/constants/Color';
import { FontSizes } from '@/constants/Typography';
import { ChatInputProps } from '@/types/components';
import { FontAwesome6 } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

const ChatInput = ({ disabled, onSubmit }: ChatInputProps) => {
	const [chatInput, setChatInput] = useState('');

	const handleSubmit = () => {
		if (!chatInput.trim()) return;

		onSubmit(chatInput.trim());
		setChatInput('');
	};

	return (
		<View style={styles.inputContainer}>
			<TextInput
				style={styles.inputText}
				value={chatInput}
				onChangeText={setChatInput}
				placeholder={disabled ? '메세지를 보낼 수 없습니다.' : '메세지 보내기'}
				placeholderTextColor={Colors.font_gray}
				multiline
				scrollEnabled
				enterKeyHint='send'
				editable={!disabled}
				testID='chatInput'
			/>
			<Pressable
				style={styles.iconContainer}
				onPress={handleSubmit}
				disabled={disabled}
				testID='submitChatButton'
			>
				<FontAwesome6
					name='circle-arrow-up'
					size={28}
					color={disabled ? Colors.icon_gray : Colors.primary}
				/>
			</Pressable>
		</View>
	);
};

export default ChatInput;

const styles = StyleSheet.create({
	inputContainer: {
		flexDirection: 'row',
		backgroundColor: 'white',
		alignItems: 'center',
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
		minHeight: 42,
		maxHeight: 90,
	},
	iconContainer: {
		marginRight: 16,
	},
});
