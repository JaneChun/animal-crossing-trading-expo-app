import { Colors } from '@/constants/Color';
import { MAX_COMMENT_LENGTH } from '@/constants/post';
import { FontSizes } from '@/constants/Typography';
import { CommentInputProps } from '@/types/components';
import { FontAwesome6 } from '@expo/vector-icons';
import { memo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { showToast } from '../ui/Toast';

const CommentInput = ({ disabled, onSubmit }: CommentInputProps) => {
	const [commentInput, setCommentInput] = useState<string>('');

	const handleChangeText = (text: string) => {
		if (text.length >= MAX_COMMENT_LENGTH) {
			const truncated = text.slice(0, MAX_COMMENT_LENGTH);

			showToast(
				'warn',
				`댓글은 최대 ${MAX_COMMENT_LENGTH}자까지만 입력 가능합니다.`,
			);

			setCommentInput(truncated);
			return;
		}
		setCommentInput(text);
	};

	const handleSubmit = () => {
		if (!commentInput.trim()) return;

		onSubmit(commentInput.trim());
		setCommentInput('');
	};

	return (
		<View
			style={styles.inputContainer}
			renderToHardwareTextureAndroid={true}
			shouldRasterizeIOS={true}
		>
			<TextInput
				style={styles.inputText}
				value={commentInput}
				onChangeText={handleChangeText}
				onSubmitEditing={handleSubmit}
				returnKeyType='send'
				placeholder={
					disabled
						? '댓글 쓰기는 로그인 후 가능합니다.'
						: '댓글을 입력해주세요.'
				}
				placeholderTextColor={Colors.font_gray}
				multiline
				scrollEnabled
				maxLength={MAX_COMMENT_LENGTH}
				enterKeyHint='send'
				editable={!disabled}
			/>
			<Pressable
				style={styles.iconContainer}
				onPress={handleSubmit}
				disabled={disabled}
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

export default memo(CommentInput);

const styles = StyleSheet.create({
	inputContainer: {
		flexDirection: 'row',
		backgroundColor: 'white',
		alignItems: 'center',
		borderTopWidth: 1,
		borderColor: Colors.border_gray,
		minHeight: 60,
		maxHeight: 100,
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
	},
	iconContainer: {
		marginRight: 16,
	},
});
