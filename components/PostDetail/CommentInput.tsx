import { Colors } from '@/constants/Color';
import { FontSizes } from '@/constants/Typography';
import { CommentInputProps } from '@/types/components';
import { FontAwesome6 } from '@expo/vector-icons';
import { memo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

const CommentInput = ({ disabled, onSubmit }: CommentInputProps) => {
	const [commentInput, setCommentInput] = useState<string>('');

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
				onChangeText={setCommentInput}
				onSubmitEditing={handleSubmit}
				returnKeyType='send'
				placeholder={
					disabled
						? '댓글 쓰기는 로그인 후 가능합니다.'
						: '댓글을 입력해주세요.'
				}
				placeholderTextColor={Colors.font_gray}
				multiline
				scrollEnabled={false}
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
		height: 60,
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
