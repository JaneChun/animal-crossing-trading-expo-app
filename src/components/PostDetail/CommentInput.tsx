import { AntDesign, FontAwesome6 } from '@expo/vector-icons';
import { forwardRef, memo, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import Text from '@/components/ui/Text';
import { showToast } from '@/components/ui/Toast';
import { MAX_COMMENT_LENGTH } from '@/constants/post';
import { FontSizes , Theme, useTheme, useThemedStyles } from '@/theme';
import { CommentInputProps } from '@/types/components';

export interface CommentInputRef {
	focus: () => void;
}

const CommentInput = forwardRef<CommentInputRef, CommentInputProps>(
	({ disabled, onSubmit, replyMode }, ref) => {
		const { colors } = useTheme();
		const styles = useThemedStyles(makeStyles);
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
			<View
				style={styles.container}
				renderToHardwareTextureAndroid={true}
				shouldRasterizeIOS={true}
			>
				{/* 답글 모드 헤더 */}
				{replyMode?.isReplyMode && (
					<View style={styles.replyHeader}>
						<Text variant="body2" color="tertiary">
							<Text weight="semibold">{replyMode.parentDisplayName}</Text>
							님에게 답글을 남기는 중
						</Text>
						<TouchableOpacity onPress={replyMode.onCancel} style={styles.cancelButton}>
							<AntDesign name="close" size={16} color={colors.text.tertiary} />
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
						returnKeyType="send"
						placeholder={
							disabled
								? '댓글 쓰기는 로그인 후 가능합니다.'
								: replyMode?.isReplyMode
									? '답글을 입력해주세요.'
									: '댓글을 입력해주세요.'
						}
						placeholderTextColor={colors.text.tertiary}
						multiline
						scrollEnabled
						maxLength={MAX_COMMENT_LENGTH}
						enterKeyHint="send"
						editable={!disabled}
					/>
					<Pressable
						style={styles.iconContainer}
						onPress={handleSubmit}
						disabled={disabled}
					>
						<FontAwesome6
							name="circle-arrow-up"
							size={28}
							color={disabled ? colors.icon.default : colors.brand.primary}
						/>
					</Pressable>
				</View>
			</View>
		);
	},
);

export default memo(CommentInput);

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			backgroundColor: colors.bg.primary,
			borderTopWidth: 1,
			borderColor: colors.border.default,
		},
		replyHeader: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingHorizontal: 16,
			paddingVertical: 8,
			backgroundColor: colors.bg.fill,
			borderBottomWidth: 1,
			borderBottomColor: colors.border.default,
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
			borderColor: colors.border.default,
			backgroundColor: colors.bg.secondary,
			borderRadius: 20,
			paddingVertical: 10,
			paddingHorizontal: 16,
			margin: 8,
			fontSize: FontSizes.md,
			color: colors.text.tertiary,
			minHeight: 42,
		},
		iconContainer: {
			marginRight: 16,
		},
	});

CommentInput.displayName = 'CommentInput';
