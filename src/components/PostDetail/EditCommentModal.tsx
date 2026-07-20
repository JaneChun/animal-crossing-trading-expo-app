import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import Button from '@/components/ui/Button';
import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import { PADDING } from '@/components/ui/layout/Layout';
import { showToast } from '@/components/ui/Toast';
import { MAX_COMMENT_LENGTH } from '@/constants/post';
import { FontSizes } from '@/constants/Typography';
import { goBack } from '@/navigation/RootNavigation';
import { Colors } from '@/theme/Color';

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

			showToast('warn', `댓글은 최대 ${MAX_COMMENT_LENGTH}자까지만 입력 가능합니다.`);

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
		<Button disabled={!isValid} color="white" size="md2" onPress={handleSubmit}>
			완료
		</Button>
	);

	const cancelButton = (
		<Button color="gray" size="md2" onPress={goBack}>
			취소
		</Button>
	);

	return (
		<CustomBottomSheet
			isVisible={isVisible}
			onClose={onClose}
			snapPoints={['95%', '100%']}
			title={title}
			rightButton={submitButton}
			leftButton={cancelButton}
			bodyStyle={styles.bottomSheetBodyStyle}
		>
			{/* 키보드 회피는 gorhom이 콘텐츠 paddingBottom으로 처리 — 인풋이 남은 영역을 채우고 내부 스크롤로 커서 유지 */}
			<BottomSheetTextInput
				style={styles.textInput}
				value={newCommentInput}
				onChangeText={handleChangeText}
				multiline
				maxLength={MAX_COMMENT_LENGTH}
			/>
		</CustomBottomSheet>
	);
};

export default EditCommentModal;

const styles = StyleSheet.create({
	bottomSheetBodyStyle: {
		padding: PADDING,
		paddingRight: 0,
	},
	textInput: {
		flex: 1,
		fontSize: FontSizes.md,
		lineHeight: 26,
		color: Colors.text.secondary,
		paddingRight: PADDING,
		textAlignVertical: 'top',
	},
});
