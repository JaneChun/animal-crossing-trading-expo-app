import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { ComponentType, useEffect, useState } from 'react';
import { ScrollViewProps, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import Button from '@/components/ui/Button';
import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import { PADDING } from '@/components/ui/layout/Layout';
import { showToast } from '@/components/ui/Toast';
import { KEYBOARD_TOOLBAR_HEIGHT } from '@/constants/keyboard';
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
			{/* 스크롤 몸통은 Gorhom, 포커스 자동 스크롤은 keyboard-controller가 담당 */}
			<KeyboardAwareScrollView
				// 스크롤 구현체로 BottomSheetScrollView 주입(직접 쓰면 자동 스크롤 사라짐).
				// 캐스트: prop 타입과 Gorhom props 타입 불일치 회피(런타임 동작 동일)
				ScrollViewComponent={
					BottomSheetScrollView as unknown as ComponentType<ScrollViewProps>
				}
				// 커서를 키보드 툴바 높이 + 여백만큼 띄워 올림(멀티라인 하단이 툴바에 가려지는 것 방지)
				bottomOffset={KEYBOARD_TOOLBAR_HEIGHT + PADDING}
				style={styles.screen}
				// 입력이 시트 남은 높이를 채우도록
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
			>
				<BottomSheetTextInput
					style={styles.textInput}
					value={newCommentInput}
					onChangeText={handleChangeText}
					multiline
					maxLength={MAX_COMMENT_LENGTH}
				/>
			</KeyboardAwareScrollView>
		</CustomBottomSheet>
	);
};

export default EditCommentModal;

const styles = StyleSheet.create({
	bottomSheetBodyStyle: {
		padding: PADDING,
		paddingRight: 0,
	},
	screen: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		paddingBottom: PADDING,
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
