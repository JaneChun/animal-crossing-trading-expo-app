import ProfileImageInput from '@/components/Profile/ProfileImageInput';
import { showToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Color';
import { updateDocToFirestore } from '@/firebase/core/firestoreService';
import {
	checkIfObjectExistsInStorage,
	deleteObjectFromStorage,
	uploadObjectToStorage,
} from '@/firebase/services/imageService';
import { useAuthStore } from '@/stores/AuthStore';
import { EditProfileModalProps } from '@/types/components';
import { UserInfo } from '@/types/user';
import { validateInput } from '@/utilities/validateInput';
import { FontAwesome } from '@expo/vector-icons';
import { ImagePickerAsset } from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../ui/Button';
import CustomModal from '../ui/CustomModal';
import NameInput from './NameInput';

const EditProfileModal = ({
	isVisible,
	onClose,
	isUploading,
	setIsUploading,
}: EditProfileModalProps) => {
	const [isSubmitted, setIsSubmitted] = useState(false);
	const userInfo = useAuthStore((state) => state.userInfo);
	const setUserInfo = useAuthStore((state) => state.setUserInfo);
	const [displayNameInput, setDisplayNameInput] = useState<string>('');
	const [islandNameInput, setIslandNameInput] = useState<string>('');
	const [image, setImage] = useState<ImagePickerAsset | null>(null); // ImagePicker로 추가한 이미지
	const [originalImageUrl, setOriginalImageUrl] = useState<string>(''); // Firestore에서 가져온 기존 이미지

	const isValid = displayNameInput.length > 0 && islandNameInput.length > 0;

	useEffect(() => {
		if (!userInfo) return;

		setDisplayNameInput(userInfo.displayName);
		setIslandNameInput(userInfo.islandName);

		if (userInfo.photoURL) {
			setOriginalImageUrl(userInfo.photoURL);
			setImage({ uri: userInfo.photoURL } as ImagePickerAsset); // UI 표시에 필요하므로 image에도 변환하여 추가
		}
	}, [userInfo]);

	const validateForm = () => {
		const displayNameInputError = validateInput(
			'displayName',
			displayNameInput,
		);
		const islandNameInputError = validateInput('islandName', islandNameInput);

		if (displayNameInputError || islandNameInputError) {
			return false;
		}

		return true;
	};

	const onSubmit = async () => {
		if (!userInfo) return;

		setIsSubmitted(true);

		if (!validateForm()) return;

		let requestData: Record<string, string> = {};
		let uploadedImageUrl: string = '';

		try {
			setIsUploading(true);
			// 닉네임
			if (displayNameInput !== userInfo.displayName) {
				requestData.displayName = displayNameInput;
			}

			// 섬 이름
			if (islandNameInput !== userInfo.islandName) {
				requestData.islandName = islandNameInput;
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

			// 기존 이미지를 삭제한 경우
			if (originalImageUrl && !image) {
				requestData.photoURL = ''; // 이미지 필드를 빈 문자열로 업데이트

				// 이전 이미지 스토리지에서 삭제
				const exists = await checkIfObjectExistsInStorage(originalImageUrl);
				if (exists) {
					await deleteObjectFromStorage(originalImageUrl);
				}
			}

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

				setUserInfo(newUserInfo);
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

	const submitButton = (
		<Button
			disabled={isUploading || !isValid}
			color='white'
			size='md2'
			onPress={onSubmit}
		>
			완료
		</Button>
	);

	if (isUploading) {
		return <LoadingIndicator />;
	}

	return (
		<CustomModal
			isVisible={isVisible}
			onClose={onClose}
			modalHeight='93%'
			title='프로필 수정'
			rightButton={submitButton}
		>
			<View style={styles.container}>
				{/* 이미지 */}
				<ProfileImageInput image={image} setImage={setImage} />

				<View style={styles.info}>
					{/* 닉네임, 섬 이름 */}
					<NameInput
						label='닉네임'
						type='displayName'
						input={displayNameInput}
						setInput={setDisplayNameInput}
						placeholder='닉네임을 입력해주세요.'
						isSubmitted={isSubmitted}
					/>
					<NameInput
						label='섬 이름'
						type='islandName'
						input={islandNameInput}
						setInput={setIslandNameInput}
						placeholder='섬 이름을 입력해주세요.'
						isSubmitted={isSubmitted}
					/>

					<View style={styles.messageContainer}>
						<FontAwesome name='leaf' color={Colors.primary} size={14} />
						<Text style={styles.infoText}>
							닉네임과 섬 이름은 동물의 숲 여권과 동일하게 입력해주세요.
						</Text>
					</View>
				</View>
			</View>
		</CustomModal>
	);
};

export default EditProfileModal;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
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
		fontSize: 14,
		marginBottom: 16,
	},
});
