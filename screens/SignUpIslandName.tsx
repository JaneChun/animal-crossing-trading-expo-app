import NameInput from '@/components/Profile/NameInput';
import Button from '@/components/ui/Button';
import CloseButton from '@/components/ui/CloseButton';
import { showToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Color';
import {
	DEFAULT_USER_REPORT,
	DEFAULT_USER_REVIEW,
} from '@/constants/defaultUserInfo';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { saveUserInfo } from '@/firebase/services/userService';
import { useProfileForm } from '@/hooks/form/Profile/useProfileForm';
import { pop } from '@/navigation/RootNavigation';
import { useAuthStore } from '@/stores/AuthStore';
import { SignUpIslandNameRouteProp } from '@/types/navigation';
import { UserInfo } from '@/types/user';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import { Timestamp } from 'firebase/firestore';
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

const SignUpIslandName = () => {
	const route = useRoute<SignUpIslandNameRouteProp>();
	const { uid, oauthType, email, displayName } = route.params;

	const setUserInfo = useAuthStore((state) => state.setUserInfo);

	// form hook 가져오기
	const methods = useProfileForm();
	const {
		control,
		watch,
		formState: { errors },
	} = methods;

	const islandName = watch('islandName');
	const isIslandNameValid = !errors.islandName && islandName.length > 0;

	const onSubmit = async () => {
		if (!isIslandNameValid) return;

		try {
			const newUserInfo: UserInfo = {
				uid,
				email,
				displayName,
				islandName,
				photoURL: '',
				review: DEFAULT_USER_REVIEW,
				report: DEFAULT_USER_REPORT,
				oauthType,
				createdAt: Timestamp.now(),
				lastLogin: Timestamp.now(),
			};

			await saveUserInfo(newUserInfo);

			// 로컬 상태 업데이트
			setUserInfo(newUserInfo);
			await AsyncStorage.setItem('@user', JSON.stringify(newUserInfo));

			showToast('success', '회원가입 성공');
		} catch (e) {
			showToast('error', '회원가입 중 오류가 발생했습니다.');
		} finally {
			backToProfile();
		}
	};

	const backToProfile = () => {
		pop(2);
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
							<Text style={styles.title}>{'섬 이름을\n입력해주세요'}</Text>

							<Controller
								control={control}
								name='islandName'
								render={({ field: { value, onChange } }) => (
									<NameInput
										type='islandName'
										value={value}
										onChangeText={onChange}
										label='섬 이름'
										placeholder='섬 이름을 입력해주세요.'
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
								disabled={!isIslandNameValid}
								onPress={onSubmit}
								color='mint'
								size='lg'
							>
								시작하기
							</Button>
						</View>
					</FormProvider>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default SignUpIslandName;

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
