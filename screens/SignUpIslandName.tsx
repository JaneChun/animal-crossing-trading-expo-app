import NameInput from '@/components/Profile/NameInput';
import Button from '@/components/ui/Button';
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
import { Ionicons } from '@expo/vector-icons';
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
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SignUpIslandName = () => {
	const route = useRoute<SignUpIslandNameRouteProp>();
	const { uid, oauthType, displayName } = route.params;

	const setUserInfo = useAuthStore((state) => state.setUserInfo);

	// form hook 가져오기
	const methods = useProfileForm();
	const {
		control,
		watch,
		formState: { errors },
	} = methods;

	const islandName = watch('islandName');
	const isIslandNameValid = !errors.islandName;

	const onSubmit = async () => {
		if (!isIslandNameValid) return;

		try {
			const newUserInfo: UserInfo = {
				uid,
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
			pop(2);
		}
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<FormProvider {...methods}>
						<View style={styles.container}>
							{/* 닫기 버튼 */}
							<TouchableOpacity
								style={styles.closeButton}
								onPress={() => pop(2)}
							>
								<Ionicons name='close' size={24} color='#000' />
							</TouchableOpacity>

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
	container: {
		flex: 1,
		backgroundColor: '#fff',
		padding: 24,
	},
	closeButton: {
		alignSelf: 'flex-end',
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
});
