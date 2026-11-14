import { useHeaderHeight } from '@react-navigation/elements';
import { useRoute } from '@react-navigation/native';
import { Controller } from 'react-hook-form';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';
import { PADDING } from '@/components/ui/layout/Layout';
import Text from '@/components/ui/Text';
import { KEYBOARD_TOOLBAR_HEIGHT } from '@/constants/keyboard';
import { APPEAL_MAX_LENGTH } from '@/hooks/sanction/form/appealFormSchema';
import { useAppealForm } from '@/hooks/sanction/form/useAppealForm';
import { useSubmitAppeal } from '@/hooks/sanction/mutation/useSubmitAppeal';
import { goBack } from '@/navigation/RootNavigation';
import { useUserInfo } from '@/stores/auth';
import { FontSizes, Spacing, Theme, useTheme, useThemedStyles } from '@/theme';
import { AppealFormRouteProp } from '@/types/navigation';

// 이의 신청 작성. 제출하면 이전 화면(정지 화면·경고 화면·문의 내역 상세)으로 돌아가 '검토 중'을 보여 준다
const AppealForm = () => {
	const styles = useThemedStyles(makeStyles);
	const { colors } = useTheme();
	const { params } = useRoute<AppealFormRouteProp>();
	const userInfo = useUserInfo();
	const headerHeight = useHeaderHeight();
	const { control, handleSubmit, watch, formState } = useAppealForm();
	const { mutate: submitAppeal, isPending } = useSubmitAppeal(userInfo?.uid ?? '');
	const contentLength = watch('content').length;

	const onSubmit = handleSubmit(({ content }) =>
		submitAppeal({ sanctionId: params.sanctionId, content }, { onSuccess: goBack }),
	);

	return (
		<SafeAreaView style={styles.screen} edges={['bottom']}>
			<KeyboardAvoidingView
				style={styles.screen}
				behavior="padding"
				keyboardVerticalOffset={headerHeight + KEYBOARD_TOOLBAR_HEIGHT}
			>
				<ScrollView
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps="handled"
				>
					<View>
						<Text variant="body1" weight="semibold" style={styles.label}>
							이의 신청 내용
						</Text>
						<Controller
							control={control}
							name="content"
							render={({ field: { value, onChange, onBlur } }) => (
								<TextInput
									style={styles.input}
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									placeholder="조치에 동의하지 않는 이유를 적어 주세요. 당시 상황을 자세히 적을수록 검토에 도움이 됩니다."
									placeholderTextColor={colors.text.tertiary}
									maxLength={APPEAL_MAX_LENGTH}
									multiline
								/>
							)}
						/>
						<Text variant="caption" color="tertiary" style={styles.counter}>
							{`${contentLength} / ${APPEAL_MAX_LENGTH}`}
						</Text>
					</View>

					<View style={styles.notices}>
						<Text variant="caption" color="tertiary">
							• 이의 신청은 조치 1건당 한 번만 보낼 수 있습니다.
						</Text>
						<Text variant="caption" color="tertiary">
							• 조치가 취소되면 정지가 해제되고 비공개된 글이 다시 공개됩니다.
						</Text>
					</View>
				</ScrollView>

				<View style={styles.footer}>
					<Button
						size="lg"
						disabled={!formState.isValid}
						isLoading={isPending}
						onPress={onSubmit}
					>
						제출하기
					</Button>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default AppealForm;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		content: {
			padding: PADDING,
			gap: Spacing.xxl,
		},
		label: {
			marginBottom: Spacing.l,
		},
		input: {
			height: 240,
			padding: Spacing.l,
			borderRadius: 10,
			backgroundColor: colors.bg.fill,
			color: colors.text.primary,
			fontSize: FontSizes.md,
			lineHeight: 24,
			textAlignVertical: 'top',
		},
		counter: {
			marginTop: Spacing.s,
			alignSelf: 'flex-end',
		},
		notices: {
			gap: Spacing.xs,
		},
		footer: {
			paddingHorizontal: PADDING,
			paddingTop: Spacing.m,
			paddingBottom: Spacing.s,
		},
	});
