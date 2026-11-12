import { FontAwesome6 } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { FontSizes } from '@/constants/Typography';
import { Theme, useTheme, useThemedStyles } from '@/theme';
import { ChatInputProps } from '@/types/components';

const ChatInput = ({ disabled, onSubmit, onImagePress }: ChatInputProps) => {
	const { colors } = useTheme();
	const styles = useThemedStyles(makeStyles);
	const [chatInput, setChatInput] = useState('');

	const handleSubmit = () => {
		if (!chatInput.trim()) return;

		onSubmit(chatInput.trim());
		setChatInput('');
	};

	return (
		<View style={styles.inputContainer}>
			{/* 이미지 추가 버튼 */}
			<Pressable
				style={[
					styles.imageButtonContainer,
					{ backgroundColor: disabled ? colors.icon.default : colors.brand.primary },
				]}
				onPress={onImagePress}
				disabled={disabled}
				testID="chatImageButton"
			>
				<FontAwesome6 name="paperclip" size={18} color={colors.text.onBrand} />
			</Pressable>

			{/* 텍스트 인풋 */}
			<TextInput
				style={styles.inputText}
				value={chatInput}
				onChangeText={setChatInput}
				placeholder={disabled ? '메세지를 보낼 수 없습니다.' : '메세지 보내기'}
				placeholderTextColor={colors.text.tertiary}
				multiline
				scrollEnabled
				enterKeyHint="send"
				editable={!disabled}
				testID="chatInput"
			/>

			{/* 전송 버튼 */}
			<Pressable
				style={styles.iconContainer}
				onPress={handleSubmit}
				disabled={disabled}
				testID="submitChatButton"
			>
				<FontAwesome6
					name="circle-arrow-up"
					size={28}
					color={disabled ? colors.icon.default : colors.brand.primary}
				/>
			</Pressable>
		</View>
	);
};

export default ChatInput;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
	inputContainer: {
		flexDirection: 'row',
		backgroundColor: colors.bg.primary,
		alignItems: 'center',
		borderColor: colors.border.default,
	},
	inputText: {
		flex: 1,
		borderWidth: 1,
		borderColor: colors.border.default,
		backgroundColor: colors.bg.secondary,
		borderRadius: 20,
		paddingVertical: 10,
		paddingHorizontal: 16,
		margin: 8,
		fontSize: FontSizes.md,
		color: colors.text.tertiary,
		minHeight: 42,
		maxHeight: 90,
	},
	imageButtonContainer: {
		marginLeft: 16,
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
	},
	iconContainer: {
		marginRight: 16,
	},
});
