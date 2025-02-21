import ProfileImageInput from '@/components/MyPage/ProfileImageInput';
import ValidationInput from '@/components/MyPage/ValidationInput';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/Color';
import { useAuthContext, UserInfo } from '@/contexts/AuthContext';
import useLoading from '@/hooks/useLoading';
import { EditProfileRouteProp } from '@/types/navigation';
import {
	deleteObjectFromStorage,
	updateDocToFirestore,
	uploadObjectToStorage,
} from '@/utilities/firebaseApi';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ImagePickerAsset } from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

const EditProfile = () => {
	const route = useRoute<EditProfileRouteProp>();
	const navigation = useNavigation();
	const { userInfo }: { userInfo: UserInfo } = route?.params ?? {};
	const { setUserInfo } = useAuthContext();
	const { isLoading, setIsLoading, LoadingIndicator } = useLoading();

	const [displayNameInput, setDisplayNameInput] = useState<string>('');
	const [islandNameInput, setIslandNameInput] = useState<string>('');
	const [image, setImage] = useState<ImagePickerAsset | null>(null); // ImagePicker로 추가한 이미지
	const [originalImageUrl, setOriginalImageUrl] = useState<string>(''); // Firestore에서 가져온 기존 이미지

	const isValid = displayNameInput.length > 0 && islandNameInput.length > 0;

	useEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<Button
					disabled={isLoading || !isValid}
					color='white'
					size='md2'
					onPress={() => onSubmit()}
				>
					완료
				</Button>
			),
		});
	}, [
		displayNameInput,
		islandNameInput,
		image,
		isValid,
		isLoading,
		navigation,
	]);

	useEffect(() => {
		if (userInfo) {
			setDisplayNameInput(userInfo.displayName || '');
			setIslandNameInput(userInfo.islandName || '');

			if (userInfo.photoURL) {
				setOriginalImageUrl(userInfo.photoURL || '');
				setImage({ uri: userInfo.photoURL } as ImagePickerAsset); // UI 표시에 필요하므로 image에도 변환하여 추가
			}
		}
	}, [userInfo]);

	const resetForm = () => {
		setDisplayNameInput('');
		setIslandNameInput('');
		setImage(null);
	};

	const onSubmit = async () => {
		if (!userInfo) return;

		let requestData: Record<string, string> = {};
		let uploadedImageUrl: string = '';

		try {
			setIsLoading(true);
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
				if (
					originalImageUrl &&
					!originalImageUrl.includes('https://k.kakaocdn.net')
				) {
					await deleteObjectFromStorage(originalImageUrl);
				}
			}

			// 기존 이미지를 삭제한 경우
			if (originalImageUrl && !image) {
				requestData.photoURL = ''; // 이미지 필드를 빈 문자열로 업데이트

				// 이전 이미지 스토리지에서 삭제
				if (!originalImageUrl.includes('https://k.kakaocdn.net')) {
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
			} else {
				console.log('변경된 데이터가 없습니다.');
			}

			Alert.alert('성공', '프로필이 성공적으로 변경되었습니다.');
			resetForm();
			navigation.goBack();
		} catch (e) {
			Alert.alert('오류', '프로필 업데이트 중 오류가 발생했습니다.');
			navigation.goBack();
			console.log(e);
		} finally {
			setIsLoading(false);
		}
	};

	if (!userInfo) {
		return (
			<View style={styles.container}>
				<Text>유저 정보를 불러오는 중...</Text>
			</View>
		);
	}

	if (isLoading) {
		return <LoadingIndicator />;
	}

	return (
		<View style={styles.container}>
			{/* 이미지 */}
			<ProfileImageInput image={image} setImage={setImage} />

			<View style={styles.info}>
				{/* 닉네임, 섬 이름 */}
				<ValidationInput
					label='닉네임'
					value={displayNameInput}
					onChangeText={setDisplayNameInput}
					placeholder='닉네임을 입력해주세요.'
				/>
				<ValidationInput
					label='섬 이름'
					value={islandNameInput}
					onChangeText={setIslandNameInput}
					placeholder='섬 이름을 입력해주세요.'
				/>

				<View style={styles.messageContainer}>
					<FontAwesome name='leaf' color={Colors.primary} size={14} />
					<Text style={styles.infoText}>
						닉네임과 섬 이름은 동물의 숲 여권과 동일하게 입력해주세요.
					</Text>
				</View>
			</View>
		</View>
	);
};

export default EditProfile;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		alignItems: 'center',
		gap: 4,
	},
	info: {
		width: '80%',
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
