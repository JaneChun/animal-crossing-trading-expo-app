import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ComponentType, ReactNode } from 'react';
import { Keyboard, ScrollViewProps, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import Button from '@/components/ui/Button';
import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import { PADDING } from '@/components/ui/layout/Layout';
import { KEYBOARD_TOOLBAR_HEIGHT } from '@/constants/keyboard';
import { Spacing } from '@/theme';

// 하단 제출 버튼 영역 높이(Button lg 52 + 위 여백)
const BUTTON_AREA_HEIGHT = 52 + Spacing.s;

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
			// contentHandlesKeyboard를 끄면 시트가 키보드에 덮인 만큼 내용 높이를 줄여 제출 버튼이 키보드 위에 남는다
			title={title}
			bodyStyle={styles.body}
		>
			{/* BottomSheetScrollView만 쓰면 여러 줄 입력의 커서를 따라 스크롤하지 않아 커서 줄이 제출 버튼 뒤로 가려진다.
			    스크롤 몸통은 Gorhom, 커서 자동 스크롤은 keyboard-controller가 담당한다(EditCommentModal과 같은 방식) */}
			<KeyboardAwareScrollView
				// 캐스트: prop 타입과 Gorhom props 타입 불일치 회피(런타임 동작 동일)
				ScrollViewComponent={
					BottomSheetScrollView as unknown as ComponentType<ScrollViewProps>
				}
				// 커서를 키보드 위 툴바와 제출 버튼 영역보다 위에 둔다
				bottomOffset={KEYBOARD_TOOLBAR_HEIGHT + BUTTON_AREA_HEIGHT + Spacing.s}
				style={styles.fields}
				contentContainerStyle={styles.fieldsContent}
				keyboardShouldPersistTaps="handled"
			>
				{children}
			</KeyboardAwareScrollView>
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
