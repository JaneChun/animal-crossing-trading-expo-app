import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import Checkbox from 'expo-checkbox';
import { Controller } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import ValidationInput from '@/components/ui/inputs/ValidationInput';
import Text from '@/components/ui/Text';
import { AndroidTesterFormValues } from '@/hooks/announcement/form/androidTesterFormSchema';
import { useAndroidTesterForm } from '@/hooks/announcement/form/useAndroidTesterForm';
import { useSubmitAndroidTesterEmail } from '@/hooks/announcement/mutation/useSubmitAndroidTesterEmail';
import { BorderRadius, FontSizes, Spacing, Theme, useThemedStyles } from '@/theme';

import AnnouncementFormSheet from './AnnouncementFormSheet';

type AndroidTesterSheetProps = {
	isVisible: boolean;
	onClose: () => void;
	onSubmitted: () => void;
};

// 테스터 모집이 끝나면 이 파일째 삭제한다
const AndroidTesterSheet = ({ isVisible, onClose, onSubmitted }: AndroidTesterSheetProps) => {
	const styles = useThemedStyles(makeStyles);
	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useAndroidTesterForm();
	const { mutate: submitEmail, isPending } = useSubmitAndroidTesterEmail();

	const isAgreed = watch('agreed');

	const handleClose = () => {
		reset();
		onClose();
	};

	const onSubmit = ({ email }: AndroidTesterFormValues) => {
		submitEmail(email, {
			onSuccess: () => {
				onSubmitted();
				handleClose();
			},
		});
	};

	return (
		<AnnouncementFormSheet
			isVisible={isVisible}
			onClose={handleClose}
			title="테스터 신청"
			submitLabel="신청"
			submitDisabled={!isAgreed}
			isSubmitting={isPending}
			onSubmit={handleSubmit(onSubmit)}
		>
			<Text variant="body2" color="secondary">
				Google Play 스토어에 로그인된 Google 계정 이메일을 입력해 주세요. 다른 이메일로는
				테스트에 초대할 수 없어요.
			</Text>

			<Text variant="body1" weight="semibold" style={styles.label}>
				이메일
			</Text>
			<Controller
				control={control}
				name="email"
				render={({ field: { value, onChange, onBlur } }) => (
					<ValidationInput
						value={value}
						onChangeText={onChange}
						onBlur={onBlur}
						placeholder="example@gmail.com"
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						autoComplete="email"
						inputStyle={styles.input}
						errorMessage={errors.email?.message}
						InputComponent={BottomSheetTextInput}
					/>
				)}
			/>

			<Controller
				control={control}
				name="agreed"
				render={({ field: { value, onChange } }) => (
					<Pressable
						style={styles.agreeRow}
						onPress={() => onChange(!value)}
						accessibilityRole="checkbox"
						accessibilityState={{ checked: value }}
					>
						<Checkbox
							value={value}
							onValueChange={onChange}
							color={value ? styles.checkedColor.color : undefined}
							style={styles.checkbox}
						/>
						<Text variant="body1">[필수] 개인정보 수집·이용에 동의합니다.</Text>
					</Pressable>
				)}
			/>
			<View style={styles.notice}>
				<Text variant="caption" color="tertiary">
					수집 항목: 이메일
				</Text>
				<Text variant="caption" color="tertiary">
					이용 목적: Android 비공개 테스트 초대
				</Text>
				<Text variant="caption" color="tertiary">
					보관 기간: 테스터 모집 종료 후 삭제
				</Text>
			</View>
		</AnnouncementFormSheet>
	);
};

export default AndroidTesterSheet;

const CHECKBOX_SIZE = 20;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		label: {
			marginTop: Spacing.xl,
			marginBottom: Spacing.m,
		},
		// NameInput의 회색 입력칸과 같다
		input: {
			fontSize: FontSizes.md,
			color: colors.text.primary,
			paddingHorizontal: 12,
			paddingVertical: 0,
			borderWidth: 1,
			borderColor: colors.bg.fill,
			borderRadius: BorderRadius.s,
			backgroundColor: colors.bg.fill,
			textAlignVertical: 'center',
			height: 45,
		},
		agreeRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.s,
			marginTop: Spacing.l,
			minHeight: 44,
		},
		checkbox: {
			width: CHECKBOX_SIZE,
			height: CHECKBOX_SIZE,
			borderRadius: '50%',
		},
		checkedColor: {
			color: colors.brand.primary,
		},
		// 체크박스 문구와 왼쪽을 맞춘다
		notice: {
			marginTop: Spacing.xs,
			paddingLeft: CHECKBOX_SIZE + Spacing.s,
		},
	});
