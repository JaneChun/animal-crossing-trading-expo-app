import { Colors } from '@/constants/Color';
import { MAX_COMMENT_LENGTH } from '@/constants/post';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { CommentInputProps } from '@/types/components';
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';
import { forwardRef, memo, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showToast } from '../ui/Toast';

export interface CommentInputRef {
	focus: () => void;
}

const CommentInput = forwardRef<CommentInputRef, CommentInputProps>(({ disabled, onSubmit, replyMode }, ref) => {
	const [commentInput, setCommentInput] = useState<string>('');
	const inputRef = useRef<TextInput>(null);

	useImperativeHandle(ref, () => ({
		focus: () => {
			inputRef.current?.focus();
		},
	}));

	const handleChangeText = (text: string) => {
		if (text.length >= MAX_COMMENT_LENGTH) {
			const truncated = text.slice(0, MAX_COMMENT_LENGTH);

			showToast('warn', `댓글은 최대 ${MAX_COMMENT_LENGTH}자까지만 입력 가능합니다.`);

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
		<View style={styles.container} renderToHardwareTextureAndroid={true} shouldRasterizeIOS={true}>
			{/* 답글 모드 헤더 */}
			{replyMode?.isReplyMode && (
				<View style={styles.replyHeader}>
					<Text style={styles.replyHeaderText}>
						<Text style={styles.semiBoldText}>{replyMode.parentDisplayName}</Text>
						님에게 답글을 남기는 중
					</Text>
					<TouchableOpacity onPress={replyMode.onCancel} style={styles.cancelButton}>
						<AntDesign name='close' size={16} color={Colors.font_gray} />
					</TouchableOpacity>
				</View>
			)}

			<View style={styles.inputContainer}>
				<TextInput
					ref={inputRef}
					style={styles.inputText}
					value={commentInput}
					onChangeText={handleChangeText}
					onSubmitEditing={handleSubmit}
					returnKeyType='send'
					placeholder={
						disabled
							? '댓글 쓰기는 로그인 후 가능합니다.'
							: replyMode?.isReplyMode
							? '답글을 입력해주세요.'
							: '댓글을 입력해주세요.'
					}
					placeholderTextColor={Colors.font_gray}
					multiline
					scrollEnabled
					maxLength={MAX_COMMENT_LENGTH}
					enterKeyHint='send'
					editable={!disabled}
				/>
				<Pressable style={styles.iconContainer} onPress={handleSubmit} disabled={disabled}>
					<FontAwesome6
						name='circle-arrow-up'
						size={28}
						color={disabled ? Colors.icon_gray : Colors.primary}
					/>
				</Pressable>
			</View>
		</View>
	);
});

export default memo(CommentInput);

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white',
		borderTopWidth: 1,
		borderColor: Colors.border_gray,
	},
	replyHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: Colors.base,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border_gray,
	},
	replyHeaderText: {
		fontSize: FontSizes.sm,
		color: Colors.font_gray,
	},
	semiBoldText: {
		fontWeight: FontWeights.semibold,
	},
	cancelButton: {
		padding: 4,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
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
