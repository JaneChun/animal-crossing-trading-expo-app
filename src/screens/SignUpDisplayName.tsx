import { FontAwesome } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { Controller, FormProvider } from 'react-hook-form';
import {
	Keyboard,
	Platform,
	StyleSheet,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import NameInput from '@/components/Profile/NameInput';
import Button from '@/components/ui/Button';
import CloseButton from '@/components/ui/CloseButton';
import Text from '@/components/ui/Text';
import { KEYBOARD_TOOLBAR_HEIGHT } from '@/constants/keyboard';
import { useProfileForm } from '@/hooks/profile/form/useProfileForm';
import { pop } from '@/navigation/RootNavigation';
import { FontSizes, FontWeights , Theme, useTheme, useThemedStyles } from '@/theme';
import { SignUpDisplayNameRouteProp } from '@/types/navigation';
import { navigateToSignUpEnd } from '@/utilities/navigationHelpers';

const SignUpDisplayName = () => {
	const { colors } = useTheme();
	const styles = useThemedStyles(makeStyles);
	const insets = useSafeAreaInsets();
	const route = useRoute<SignUpDisplayNameRouteProp>();
	const { uid, oauthType, email } = route.params;

	// form hook 가져오기
	const methods = useProfileForm();
	const {
		control,
		watch,
		formState: { errors },
	} = methods;

	const displayName = watch('displayName');
	const isDisplayNameValid = !errors.displayName && displayName.length > 0;

	const handleNext = () => {
		if (!isDisplayNameValid) return;

		navigateToSignUpEnd({ uid, oauthType, email, displayName });
	};

	const backToProfile = () => {
		pop(2);
	};

	return (
		<SafeAreaView style={styles.screen} edges={['bottom']}>
			<KeyboardAvoidingView
				style={styles.screen}
				behavior="padding"
				// Android는 하단 inset이 내비게이션 모드마다 달라, 화면 위쪽 기준(상태바 높이)으로 계산한다.
				// 컨테이너 아래 패딩(24)만큼 빼서 버튼이 iOS처럼 툴바 바로 위에 오게 한다
				keyboardVerticalOffset={
					Platform.OS === 'android'
						? insets.top + KEYBOARD_TOOLBAR_HEIGHT - 24
						: insets.bottom + KEYBOARD_TOOLBAR_HEIGHT + 12
				}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<FormProvider {...methods}>
						<View style={styles.container}>
							{/* 닫기 버튼 */}
							<CloseButton style={styles.closeButton} onPress={backToProfile} />

							{/* 타이틀 */}
							<Text variant="display" weight="bold" style={styles.title}>
								{'닉네임을\n입력해주세요'}
							</Text>

							<Controller
								control={control}
								name="displayName"
								render={({ field: { value, onChange } }) => (
									<NameInput
										type="displayName"
										value={value}
										onChangeText={onChange}
										label="닉네임"
										placeholder="닉네임을 입력해주세요."
									/>
								)}
							/>

							<View style={styles.messageContainer}>
								<FontAwesome name="leaf" color={colors.brand.primary} size={14} />
								<Text variant="body2" style={styles.infoText}>
									닉네임과 섬 이름은 동물의 숲 여권과 동일하게 입력해주세요.
								</Text>
							</View>

							{/*  버튼 */}
							<Button
								disabled={!isDisplayNameValid}
								onPress={handleNext}
								variant="primary"
								size="lg"
								style={styles.button}
							>
								다음
							</Button>
						</View>
					</FormProvider>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default SignUpDisplayName;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		container: {
			flex: 1,
			backgroundColor: colors.bg.primary,
			padding: 24,
		},
		closeButton: {
			alignSelf: 'flex-end',
			padding: 0,
		},
		title: {
			marginTop: 24,
			marginBottom: 32,
		},
		inputContainer: {
			width: '100%',
			marginBottom: 24,
		},
		label: {
			fontSize: FontSizes.md,
			fontWeight: FontWeights.semibold,
			color: colors.text.primary,
			marginBottom: 16,
		},
		input: {
			fontSize: FontSizes.md,
			padding: 12,
			borderWidth: 1,
			borderColor: colors.bg.fill,
			borderRadius: 8,
			backgroundColor: colors.bg.fill,
			marginBottom: 8,
			textAlignVertical: 'center',
		},
		messageContainer: {
			paddingHorizontal: 12,
			flexDirection: 'row',
			gap: 8,
			marginBottom: 8,
		},
		infoText: {
			color: colors.brand.primary,
			marginBottom: 16,
		},
		button: {
			marginTop: 'auto',
		},
	});
