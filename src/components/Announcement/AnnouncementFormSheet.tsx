import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ReactNode } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';

import Button from '@/components/ui/Button';
import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import { PADDING } from '@/components/ui/layout/Layout';
import { Spacing } from '@/theme';

type AnnouncementFormSheetProps = {
	isVisible: boolean;
	onClose: () => void;
	title: string;
	submitLabel: string;
	submitDisabled: boolean;
	isSubmitting: boolean;
	onSubmit: () => void;
	children: ReactNode;
};

// 공지 상세 하단 버튼으로 여는 폼 시트의 공통 틀. 필드 영역은 폼마다 children으로 넣는다
const AnnouncementFormSheet = ({
	isVisible,
	onClose,
	title,
	submitLabel,
	submitDisabled,
	isSubmitting,
	onSubmit,
	children,
}: AnnouncementFormSheetProps) => {
	// Android는 포커스된 입력이 사라지면 화면의 다른 입력으로 포커스를 넘겨 키보드가 남으므로 먼저 내린다
	const handleClose = () => {
		Keyboard.dismiss();
		onClose();
	};

	const handleSubmit = () => {
		Keyboard.dismiss();
		onSubmit();
	};

	return (
		<CustomBottomSheet
			isVisible={isVisible}
			onClose={handleClose}
			snapPoints={['95%', '100%']}
			// contentHandlesKeyboard를 끄면 시트가 키보드에 덮인 만큼 내용 높이를 줄여 제출 버튼이 키보드 위에 남는다.
			// 그래서 필드 영역은 키보드 여백을 스스로 넣지 않는 BottomSheetScrollView로 둔다
			title={title}
			bodyStyle={styles.body}
		>
			<BottomSheetScrollView
				style={styles.fields}
				contentContainerStyle={styles.fieldsContent}
				keyboardShouldPersistTaps="handled"
			>
				{children}
			</BottomSheetScrollView>
			<View style={styles.buttonContainer}>
				<Button
					variant="primary"
					size="lg"
					flex
					isLoading={isSubmitting}
					disabled={submitDisabled || isSubmitting}
					onPress={handleSubmit}
				>
					{submitLabel}
				</Button>
			</View>
		</CustomBottomSheet>
	);
};

export default AnnouncementFormSheet;

const styles = StyleSheet.create({
	body: {
		padding: 0,
	},
	fields: {
		flex: 1,
	},
	fieldsContent: {
		flexGrow: 1,
		padding: PADDING,
	},
	buttonContainer: {
		flexDirection: 'row',
		paddingHorizontal: PADDING,
		paddingTop: Spacing.s,
	},
});
