import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import { Colors } from '@/constants/Color';
import { FontSizes } from '@/constants/Typography';
import { goBack } from '@/navigation/RootNavigation';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Button from '../ui/Button';
import { PADDING } from '../ui/layout/Layout';

type EditCommentModalProps = {
	comment: string;
	isVisible: boolean;
	onClose: () => void;
	onSubmit: (comment: string) => void;
};

const EditCommentModal = ({
	comment,
	isVisible,
	onClose,
	onSubmit,
}: EditCommentModalProps) => {
	const [newCommentInput, setNewCommentInput] = useState(comment);

	useEffect(() => {
		setNewCommentInput(comment);
	}, [comment]);

	const isValid = newCommentInput?.length > 0;

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
			heightRatio={0.9}
			title='댓글 수정'
			rightButton={submitButton}
			leftButton={cancelButton}
			bodyStyle={styles.bottomSheetBodyStyle}
		>
			<KeyboardAwareScrollView style={styles.screen}>
				<BottomSheetTextInput
					style={styles.textInput}
					value={newCommentInput}
					onChangeText={setNewCommentInput}
					multiline
					scrollEnabled={false}
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
	},
	textInput: {
		fontSize: FontSizes.md,
		lineHeight: 26,
		color: Colors.font_dark_gray,
		paddingRight: PADDING,
	},
});
