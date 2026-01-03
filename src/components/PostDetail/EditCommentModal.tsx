import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import { Colors } from '@/constants/Color';
import { MAX_COMMENT_LENGTH } from '@/constants/post';
import { FontSizes } from '@/constants/Typography';
import { goBack } from '@/navigation/RootNavigation';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Button from '@/components/ui/Button';
import { PADDING } from '@/components/ui/layout/Layout';
import { showToast } from '@/components/ui/Toast';

type EditCommentModalProps = {
	comment: string;
	isVisible: boolean;
	onClose: () => void;
	onSubmit: (comment: string) => void;
	title?: string;
};

const EditCommentModal = ({
	comment,
	isVisible,
	onClose,
	onSubmit,
	title = '댓글 수정',
}: EditCommentModalProps) => {
	const [newCommentInput, setNewCommentInput] = useState(comment);

	useEffect(() => {
		setNewCommentInput(comment);
	}, [comment]);

	const isValid = newCommentInput?.length > 0;

	const handleChangeText = (text: string) => {
		if (text.length >= MAX_COMMENT_LENGTH) {
			const truncated = text.slice(0, MAX_COMMENT_LENGTH);

			showToast(
				'warn',
				`댓글은 최대 ${MAX_COMMENT_LENGTH}자까지만 입력 가능합니다.`,
			);

			setNewCommentInput(truncated);
			return;
		}
		setNewCommentInput(text);
	};

	const handleSubmit = () => {
		if (!newCommentInput.trim()) return;

		onSubmit(newCommentInput.trim());
		setNewCommentInput('');
	};

	const submitButton = (
		<Button disabled={!isValid} color='white' size='md2' onPress={handleSubmit}>
			완료
		</Button>
	);

	const cancelButton = (
		<Button color='gray' size='md2' onPress={goBack}>
			취소
		</Button>
	);

	return (
		<CustomBottomSheet
			isVisible={isVisible}
			onClose={onClose}
			heightRatio={0.95}
			title={title}
			rightButton={submitButton}
			leftButton={cancelButton}
			bodyStyle={styles.bottomSheetBodyStyle}
		>
			<KeyboardAwareScrollView style={styles.screen}>
				<BottomSheetTextInput
					style={styles.textInput}
					value={newCommentInput}
					onChangeText={handleChangeText}
					multiline
					scrollEnabled={false}
					maxLength={MAX_COMMENT_LENGTH}
				/>
			</KeyboardAwareScrollView>
		</CustomBottomSheet>
	);
};

export default EditCommentModal;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
	bottomSheetBodyStyle: {
		padding: PADDING,
		paddingRight: 0,
		paddingBottom: 150,
	},
	textInput: {
		fontSize: FontSizes.md,
		lineHeight: 26,
		color: Colors.font_dark_gray,
		paddingRight: PADDING,
	},
});
