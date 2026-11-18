import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Controller } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import ValidationInput from '@/components/ui/inputs/ValidationInput';
import Text from '@/components/ui/Text';
import { FeedbackFormValues } from '@/hooks/announcement/form/feedbackFormSchema';
import { useFeedbackForm } from '@/hooks/announcement/form/useFeedbackForm';
import { useSubmitFeedback } from '@/hooks/announcement/mutation/useSubmitFeedback';
import { BorderRadius, FontSizes, Spacing, Theme, useThemedStyles } from '@/theme';

import AnnouncementFormSheet from './AnnouncementFormSheet';

type FeedbackSheetProps = {
	isVisible: boolean;
	onClose: () => void;
};

const FeedbackSheet = ({ isVisible, onClose }: FeedbackSheetProps) => {
	const styles = useThemedStyles(makeStyles);
	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useFeedbackForm();
	const { mutate: sendFeedback, isPending } = useSubmitFeedback();

	const isBodyEmpty = watch('body').trim().length === 0;

	const handleClose = () => {
		reset();
		onClose();
	};

	const onSubmit = ({ body }: FeedbackFormValues) => {
		sendFeedback(body, { onSuccess: handleClose });
	};

	return (
		<AnnouncementFormSheet
			isVisible={isVisible}
			onClose={handleClose}
			title="의견 보내기"
			submitLabel="보내기"
			submitDisabled={isBodyEmpty}
			isSubmitting={isPending}
			onSubmit={handleSubmit(onSubmit)}
		>
			<Text variant="body2" color="secondary">
				불편했던 점, 있었으면 하는 기능 등 무엇이든 적어 주세요. 보내 주신 의견은 운영자만
				확인합니다.
			</Text>
			<Controller
				control={control}
				name="body"
				render={({ field: { value, onChange, onBlur } }) => (
					<ValidationInput
						value={value}
						onChangeText={onChange}
						onBlur={onBlur}
						placeholder="의견을 입력해 주세요."
						accessibilityLabel="의견"
						multiline
						inputStyle={styles.input}
						errorMessage={errors.body?.message}
						InputComponent={BottomSheetTextInput}
					/>
				)}
			/>
		</AnnouncementFormSheet>
	);
};

export default FeedbackSheet;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		// 테두리 없는 입력은 입력칸인지 알아보기 어려워 이메일 칸과 같은 회색 칸으로 그린다
		input: {
			flex: 1,
			minHeight: 200,
			marginTop: Spacing.l,
			padding: 12,
			borderWidth: 1,
			borderColor: colors.bg.fill,
			borderRadius: BorderRadius.s,
			backgroundColor: colors.bg.fill,
			fontSize: FontSizes.md,
			lineHeight: 24,
			color: colors.text.primary,
			textAlignVertical: 'top',
		},
	});
