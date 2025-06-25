import NameInput from '@/components/Profile/NameInput';
import Button from '@/components/ui/Button';
import CloseButton from '@/components/ui/CloseButton';
import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useProfileForm } from '@/hooks/profile/form/useProfileForm';
import { goBack } from '@/navigation/RootNavigation';
import { SignUpDisplayNameRouteProp } from '@/types/navigation';
import { navigateToSignUpEnd } from '@/utilities/navigationHelpers';
import { FontAwesome } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import React from 'react';
import { Controller, FormProvider } from 'react-hook-form';
import {
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SignUpDisplayName = () => {
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
		goBack();
	};

	return (
		<SafeAreaView style={styles.screen} edges={['bottom']}>
			<KeyboardAvoidingView
				style={styles.screen}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<FormProvider {...methods}>
						<View style={styles.container}>
							{/* 닫기 버튼 */}
							<CloseButton style={styles.closeButton} onPress={backToProfile} />

							{/* 타이틀 */}
							<Text style={styles.title}>{'닉네임을\n입력해주세요'}</Text>

							<Controller
								control={control}
								name='displayName'
								render={({ field: { value, onChange } }) => (
									<NameInput
										type='displayName'
										value={value}
										onChangeText={onChange}
										label='닉네임'
										placeholder='닉네임을 입력해주세요.'
									/>
								)}
							/>

							<View style={styles.messageContainer}>
								<FontAwesome name='leaf' color={Colors.primary} size={14} />
								<Text style={styles.infoText}>
									닉네임과 섬 이름은 동물의 숲 여권과 동일하게 입력해주세요.
								</Text>
							</View>

							{/*  버튼 */}
							<Button
								disabled={!isDisplayNameValid}
								onPress={handleNext}
								color='mint'
								size='lg'
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

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
	container: {
		flex: 1,
		backgroundColor: '#fff',
		padding: 24,
	},
	closeButton: {
		alignSelf: 'flex-end',
		padding: 0,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginTop: 24,
		marginBottom: 32,
		lineHeight: 32,
	},
	inputContainer: {
		width: '100%',
		marginBottom: 24,
	},
	label: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
		color: Colors.font_black,
		marginBottom: 16,
	},
	input: {
		fontSize: FontSizes.md,
		padding: 12,
		borderWidth: 1,
		borderColor: Colors.base,
		borderRadius: 8,
		backgroundColor: Colors.base,
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
		color: Colors.primary,
		fontSize: FontSizes.sm,
		marginBottom: 16,
	},
});
