import ProfileImageInput from '@/components/Profile/ProfileImageInput';
import { showToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Color';
import { FontSizes } from '@/constants/Typography';
import { updateDocToFirestore } from '@/firebase/core/firestoreService';
import {
	checkIfObjectExistsInStorage,
	deleteObjectFromStorage,
	uploadObjectToStorage,
} from '@/firebase/services/imageService';
import { useProfileForm } from '@/hooks/profile/form/useProfileForm';
import { useAuthStore } from '@/stores/AuthStore';
import { EditProfileModalProps } from '@/types/components';
import { UserInfo } from '@/types/user';
import { FontAwesome } from '@expo/vector-icons';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImagePickerAsset } from 'expo-image-picker';
import React, { useEffect } from 'react';
import { Controller, FormProvider } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Button from '../ui/Button';
import CustomBottomSheet from '../ui/CustomBottomSheet';
import { PADDING } from '../ui/layout/Layout';
import LoadingIndicator from '../ui/loading/LoadingIndicator';
import NameInput from './NameInput';

const EditProfileModal = ({
	isVisible,
	onClose,
	isUploading,
	setIsUploading,
}: EditProfileModalProps) => {
	const userInfo = useAuthStore((state) => state.userInfo);
	const setUserInfo = useAuthStore((state) => state.setUserInfo);

	// form hook 가져오기
	const methods = useProfileForm();
	const {
		control,
		watch,
		setValue,
		handleSubmit,
		reset,
		formState: { errors },
	} = methods;

	// userInfo 값으로 form 초기 세팅
	useEffect(() => {
		if (!userInfo) return;

		setValue('displayName', userInfo.displayName);
		setValue('islandName', userInfo?.islandName ?? '');

		if (userInfo.photoURL) {
			setValue('originalImageUrl', userInfo.photoURL);
			setValue('image', { uri: userInfo.photoURL } as ImagePickerAsset); // UI 표시에 필요하므로 image에도 변환하여 추가
		}
	}, [userInfo]);

	const displayName = watch('displayName');
	const islandName = watch('islandName');
	const image = watch('image');
	const originalImageUrl = watch('originalImageUrl');

	const isDisplayNameValid = !errors.displayName && displayName.length > 0;
	const isIslandNameValid = !errors.islandName && islandName.length > 0;

	const isValid = isDisplayNameValid && isIslandNameValid;

	const handleClose = () => {
		reset();
		onClose();
	};

	const onSubmit = async () => {
		if (!userInfo || !isValid) return;

		let requestData: Record<string, string> = {};
		let uploadedImageUrl: string = '';

		try {
			setIsUploading(true);
			// 닉네임
			if (displayName !== userInfo.displayName) {
				requestData.displayName = displayName;
			}

			// 섬 이름
			if (islandName !== userInfo.islandName) {
				requestData.islandName = islandName;
			}

			// 기존 이미지가 있었고, 새로운 이미지로 변경한 경우
			if (image && image.uri !== originalImageUrl) {
				// 새로운 이미지 스토리지에 업로드
				const result = await uploadObjectToStorage({
					directory: 'Users',
					images: [image],
				});
				uploadedImageUrl = result[0];
				requestData.photoURL = uploadedImageUrl;

				// 이전 이미지 스토리지에서 삭제
				const exists = await checkIfObjectExistsInStorage(originalImageUrl);
				if (exists) {
					await deleteObjectFromStorage(originalImageUrl);
				}
			}

			// 기존 이미지만 삭제한 경우
			if (originalImageUrl && !image) {
				requestData.photoURL = ''; // 이미지 필드를 빈 문자열로 업데이트

				// 이전 이미지 스토리지에서 삭제
				const exists = await checkIfObjectExistsInStorage(originalImageUrl);
				if (exists) {
					await deleteObjectFromStorage(originalImageUrl);
				}
			}

			// 수정사항 있을 때만 firestore 업데이트
			if (Object.keys(requestData).length > 0) {
				await updateDocToFirestore({
					id: userInfo.uid,
					collection: 'Users',
					requestData,
				});

				const newUserInfo: UserInfo = {
					...userInfo,
					...requestData,
				};

				// 로컬 상태 업데이트
				setUserInfo(newUserInfo);
				await AsyncStorage.setItem('@user', JSON.stringify(newUserInfo));

				showToast('success', '프로필이 성공적으로 변경되었습니다.');
			} else {
				console.log('변경된 데이터가 없습니다.');
			}
		} catch (e) {
			showToast('error', '프로필 업데이트 중 오류가 발생했습니다.');
		} finally {
			setIsUploading(false);
			onClose();
		}
	};

	const onError = (e: any) => {
		console.log(e);
	};

	const submitButton = (
		<Button
			disabled={!isValid || isUploading}
			color='white'
			size='md2'
			onPress={handleSubmit(onSubmit, onError)}
		>
			완료
		</Button>
	);

	if (isUploading) {
		return <LoadingIndicator />;
	}

	return (
		<FormProvider {...methods}>
			<CustomBottomSheet
				isVisible={isVisible}
				onClose={handleClose}
				heightRatio={0.9}
				title='프로필 수정'
				rightButton={submitButton}
				bodyStyle={styles.bottomSheetBodyStyle}
			>
				<KeyboardAwareScrollView style={styles.screen}>
					<View style={styles.container}>
						{/* 이미지 */}
						<Controller
							control={control}
							name='image'
							render={({ field: { value, onChange } }) => (
								<ProfileImageInput image={value} setImage={onChange} />
							)}
						/>

						{/* 닉네임, 섬 이름 */}
						<View style={styles.info}>
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
										InputComponent={BottomSheetTextInput}
									/>
								)}
							/>
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
										InputComponent={BottomSheetTextInput}
									/>
								)}
							/>

							<View style={styles.messageContainer}>
								<FontAwesome name='leaf' color={Colors.primary} size={14} />
								<Text style={styles.infoText}>
									닉네임과 섬 이름은 동물의 숲 여권과 동일하게 입력해주세요.
								</Text>
							</View>
						</View>
					</View>
				</KeyboardAwareScrollView>
			</CustomBottomSheet>
		</FormProvider>
	);
};

export default EditProfileModal;

const styles = StyleSheet.create({
	bottomSheetBodyStyle: {
		padding: PADDING,
		paddingRight: 0,
		paddingBottom: 150,
	},
	screen: {
		flex: 1,
		paddingRight: PADDING,
		backgroundColor: 'white',
	},
	container: {
		flex: 1,
		alignItems: 'center',
		gap: 4,
	},
	info: {
		width: '90%',
	},
	messageContainer: {
		paddingHorizontal: 12,
		flexDirection: 'row',
		gap: 8,
	},
	infoText: {
		color: Colors.primary,
		fontSize: FontSizes.sm,
		marginBottom: 16,
	},
});
