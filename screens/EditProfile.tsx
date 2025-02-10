import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity,
	Alert,
	TextInput,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ImagePickerAsset, launchImageLibraryAsync } from 'expo-image-picker';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { updateDocToFirestore } from '@/utilities/firebaseApi';
import { Colors } from '@/constants/Color';
import { Entypo } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { EditProfileRouteProp } from '@/types/navigation';
import Button from '@/components/ui/Button';
import { UserInfo } from '@/contexts/AuthContext';

const EditProfile = () => {
	const route = useRoute<EditProfileRouteProp>();
	const { userInfo }: { userInfo: UserInfo } = route?.params ?? {};

	const [displayNameInput, setDisplayNameInput] = useState<string>(
		userInfo?.displayName ?? '',
	);
	const [islandNameInput, setIslandNameInput] = useState<string>(
		userInfo?.islandName ?? '',
	);
	const [image, setImage] = useState<ImagePickerAsset | null>(null);
	// const [originalImageUrl, setOriginalImageUrl] = useState<string>('');

	const { showActionSheetWithOptions } = useActionSheet();
	const navigation = useNavigation();

	useEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<Button
					disabled={displayNameInput === '' || islandNameInput === ''}
					color='white'
					size='md2'
					onPress={() => onSubmit()}
				>
					완료
				</Button>
			),
		});
	}, [displayNameInput, islandNameInput]);

	const showImageEditOptions = () => {
		const options = ['앨범에서 사진 선택', '기본 이미지 적용', '취소'];
		const cancelButtonIndex = 2;

		showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex,
			},
			async (selectedIndex) => {
				if (selectedIndex === 0) {
					pickImage();
				} else if (selectedIndex === 1) {
					deleteImage();
				}
			},
		);
	};

	const pickImage = async () => {
		const result = await launchImageLibraryAsync({
			mediaTypes: 'images',
			aspect: [1, 1],
			quality: 0,
		});

		if (!result.canceled) {
			setImage(result.assets[0]);
		}
	};

	const deleteImage = () => {
		console.log('delete image');
		// firebase storage에서도 삭제
	};

	const resetForm = () => {
		setDisplayNameInput('');
		setIslandNameInput('');
		setImage(null);
	};

	const onSubmit = async () => {
		if (!userInfo) return;

		let requestData: Record<string, string> = {};

		try {
			// 닉네임 변경
			if (displayNameInput !== userInfo.displayName) {
				requestData.displayName = displayNameInput;
			}

			// 섬 이름 변경
			if (islandNameInput !== userInfo.islandName) {
				requestData.islandName = islandNameInput;
			}

			console.log('requestData', requestData);

			if (Object.keys(requestData).length === 0) {
				console.log('변경된 데이터가 없습니다.');
			} else {
				requestData = { ...requestData, islandName: islandNameInput };

				await updateDocToFirestore({
					id: userInfo.uid,
					collection: 'Users',
					requestData,
				});

				// 프로필 사진 변경
				// if (image) {
				// 	const [uploadedImageUrl] = await uploadObjectToStorage({
				// 		directory: 'Users',
				// 		images: [image],
				// 	});

				// 	requestData = { ...requestData, photoURL: uploadedImageUrl };
				// }

				// // 이전 이미지 삭제
				// if (userInfo?.photoURL) {
				// 	await deleteObjectFromStorage(userInfo.photoURL);
				// }
			}

			resetForm();
			navigation.goBack();

			Alert.alert('성공', '프로필이 성공적으로 변경되었습니다.');
		} catch (e) {
			Alert.alert('오류', '프로필 업데이트 중 오류가 발생했습니다.');
			navigation.goBack();
			console.log(e);
		}
	};

	if (!userInfo) {
		return (
			<View style={styles.container}>
				<Text>유저 정보를 불러오는 중...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* 이미지 */}
			<TouchableOpacity
				style={styles.imageContainer}
				activeOpacity={0.8}
				onPress={showImageEditOptions}
			>
				<Image
					source={{ uri: image ? image.uri : userInfo!.photoURL }}
					style={styles.image}
				/>
				<View style={[styles.image, styles.imageEditIconContainer]}>
					<View style={styles.imageEditIcon}>
						<Entypo name='camera' size={16} color={Colors.font_gray} />
					</View>
				</View>
			</TouchableOpacity>

			<View style={styles.info}>
				{/* 닉네임 */}
				<View>
					<View style={styles.inputContainer}>
						<Text style={styles.label}>닉네임</Text>
						<TextInput
							value={displayNameInput}
							onChangeText={(text) => setDisplayNameInput(text)}
							placeholder='닉네임을 입력해주세요.'
							placeholderTextColor={Colors.font_gray}
							style={styles.input}
						/>
					</View>

					{/* 섬 이름 */}
					<View style={styles.inputContainer}>
						{/* <Image
						source={{
							uri: 'https://firebasestorage.googleapis.com/v0/b/animal-crossing-trade-app.appspot.com/o/Src%2FCoconut_Tree_NH_Inv_Icon.png?alt=media&token=cd997010-694e-49b0-9390-483772cdad8a',
						}}
						style={styles.islandIcon}
					/> */}
						<Text style={styles.label}>섬 이름</Text>
						<TextInput
							value={islandNameInput}
							onChangeText={(text) => setIslandNameInput(text)}
							placeholder='섬 이름을 입력해주세요.'
							placeholderTextColor={Colors.font_gray}
							style={styles.input}
						/>
					</View>
				</View>
			</View>
		</View>
	);
};

export default EditProfile;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.base,
		alignItems: 'center',
		gap: 4,
	},
	info: {
		width: '80%',
	},
	imageContainer: {
		position: 'relative',
		marginTop: 24,
		marginBottom: 16,
	},
	image: {
		width: 100,
		height: 100,
		borderRadius: 50,
	},
	imageEditIconContainer: {
		position: 'absolute',
		bottom: -75,
		right: -75,
	},
	imageEditIcon: {
		width: 25,
		height: 25,
		borderRadius: 10,
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
	},
	inputContainer: {
		width: '100%',
		marginBottom: 24,
		gap: 16,
	},
	label: {
		fontSize: 16,
		fontWeight: 600,
		color: Colors.font_black,
	},
	input: {
		fontSize: 16,
		padding: 12,
		borderWidth: 1,
		borderColor: Colors.border_gray,
		borderRadius: 8,
		backgroundColor: Colors.base,
	},
});
