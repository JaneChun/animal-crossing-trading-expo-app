import { useHeaderHeight } from '@react-navigation/elements';
import { useRoute } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';
import { useEffect } from 'react';
import { Controller, FormProvider } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AdminGuard from '@/components/Admin/AdminGuard';
import BodyInput from '@/components/NewPost/BodyInput';
import TitleInput from '@/components/NewPost/TitleInput';
import Button from '@/components/ui/Button';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import Layout, { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import Text from '@/components/ui/Text';
import { KEYBOARD_TOOLBAR_HEIGHT } from '@/constants/keyboard';
import { useCreateAnnouncement } from '@/hooks/admin/mutation/useCreateAnnouncement';
import { useUpdateAnnouncement } from '@/hooks/admin/mutation/useUpdateAnnouncement';
import { AnnouncementFormValues } from '@/hooks/announcement/form/announcementFormSchema';
import { useAnnouncementForm } from '@/hooks/announcement/form/useAnnouncementForm';
import { useAnnouncement } from '@/hooks/announcement/query/useAnnouncement';
import { goBack } from '@/navigation/RootNavigation';
import { FontSizes, FontWeights, Spacing, Theme, useThemedStyles } from '@/theme';
import { AdminAnnouncementEditRouteProp } from '@/types/navigation';

const AdminAnnouncementEdit = () => {
	const styles = useThemedStyles(makeStyles);
	const { params } = useRoute<AdminAnnouncementEditRouteProp>();
	const editingId = params.id ?? '';
	const insets = useSafeAreaInsets();
	const headerHeight = useHeaderHeight();
	// 하단 inset이 0인 기기(iPhone SE 등)에서 버튼이 화면 끝에 붙지 않도록 최소 여백을 둔다
	const buttonBottomPadding = Math.max(Spacing.s, insets.bottom);

	const { data: announcement, isLoading } = useAnnouncement(editingId);
	const methods = useAnnouncementForm();
	const { control, reset, handleSubmit } = methods;

	const { mutate: createAnnouncement, isPending: isCreating } = useCreateAnnouncement();
	const { mutate: updateAnnouncement, isPending: isUpdating } = useUpdateAnnouncement(editingId);
	const isSaving = isCreating || isUpdating;

	// 수정할 공지를 불러오면 폼을 채운다.
	// 앱 복귀·네트워크 재연결로 다시 조회될 때 입력 중인 내용을 덮어쓰지 않도록 고친 칸은 유지한다
	useEffect(() => {
		if (!announcement) return;
		reset(
			{ title: announcement.title, body: announcement.body, hidden: announcement.hidden },
			{ keepDirtyValues: true },
		);
	}, [announcement, reset]);

	// 실패하면 토스트만 띄우고 입력 내용과 화면을 유지한다 (mutation 훅의 onError)
	const onSubmit = (formData: AnnouncementFormValues) => {
		if (editingId) {
			updateAnnouncement(formData, { onSuccess: goBack });
		} else {
			createAnnouncement(formData, { onSuccess: goBack });
		}
	};

	if (editingId && isLoading) return <LoadingIndicator />;
	// 불러오지 못한 채 빈 폼으로 저장하면 기존 제목·본문을 덮어쓰고 숨김도 풀리므로 폼을 보여 주지 않는다
	if (editingId && !announcement) return <EmptyIndicator message="공지를 찾을 수 없습니다." />;

	return (
		<AdminGuard>
			<FormProvider {...methods}>
				<Layout>
					<KeyboardAvoidingView
						behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
						style={styles.flex}
						keyboardVerticalOffset={headerHeight + insets.top + KEYBOARD_TOOLBAR_HEIGHT}
					>
						<ScrollView style={styles.form}>
							<Controller
								control={control}
								name="title"
								render={({ field: { value, onChange, onBlur } }) => (
									<TitleInput
										title={value}
										setTitle={onChange}
										onBlur={onBlur}
										containerStyle={[
											styles.inputContainer,
											styles.titleContainer,
										]}
										inputStyle={[styles.input, styles.titleInput]}
									/>
								)}
							/>
							<Controller
								control={control}
								name="body"
								render={({ field: { value, onChange, onBlur } }) => (
									<BodyInput
										body={value}
										setBody={onChange}
										onBlur={onBlur}
										containerStyle={styles.inputContainer}
										inputStyle={styles.input}
									/>
								)}
							/>
							<Controller
								control={control}
								name="hidden"
								render={({ field: { value, onChange } }) => (
									<View style={styles.checkboxRow}>
										<Checkbox
											value={value}
											onValueChange={onChange}
											color={value ? styles.checkedColor.color : undefined}
											style={styles.checkbox}
										/>
										<Text variant="body1">숨기기</Text>
									</View>
								)}
							/>
						</ScrollView>
					</KeyboardAvoidingView>

					<View style={[styles.buttonContainer, { paddingBottom: buttonBottomPadding }]}>
						<Button
							variant="primary"
							size="lg"
							flex
							isLoading={isSaving}
							disabled={isSaving}
							onPress={handleSubmit(onSubmit)}
						>
							저장
						</Button>
					</View>
				</Layout>
			</FormProvider>
		</AdminGuard>
	);
};

export default AdminAnnouncementEdit;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		flex: {
			flex: 1,
		},
		form: {
			padding: PADDING,
		},
		inputContainer: {
			borderColor: colors.border.default,
			borderBottomWidth: 1,
			marginBottom: 16,
		},
		titleContainer: {
			marginBottom: 0,
		},
		input: {
			fontSize: FontSizes.md,
			fontWeight: FontWeights.regular,
			color: colors.text.primary,
		},
		titleInput: {
			fontSize: FontSizes.lg,
			fontWeight: FontWeights.semibold,
			paddingVertical: 12,
		},
		checkboxRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.s,
		},
		checkbox: {
			borderRadius: '50%',
		},
		checkedColor: {
			color: colors.brand.primary,
		},
		buttonContainer: {
			padding: PADDING,
			marginTop: 8,
			flexDirection: 'row',
		},
	});
