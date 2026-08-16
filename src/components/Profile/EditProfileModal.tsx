import { FontAwesome } from '@expo/vector-icons';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { ImagePickerAsset } from 'expo-image-picker';
import { ComponentType, useContext, useEffect } from 'react';
import { Controller, FieldErrors, FormProvider } from 'react-hook-form';
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Image,
	ScrollViewProps,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import ProfileImageInput from '@/components/Profile/ProfileImageInput';
import Button from '@/components/ui/Button';
import CustomBottomSheet from '@/components/ui/CustomBottomSheet';
import { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { showToast } from '@/components/ui/Toast';
import { KEYBOARD_TOOLBAR_HEIGHT } from '@/constants/keyboard';
import { FRUIT_IMAGES } from '@/constants/profile';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { updateDocToFirestore } from '@/firebase/core/firestoreService';
import {
	checkIfObjectExistsInStorage,
	deleteObjectFromStorage,
	uploadObjectToStorage,
} from '@/firebase/services/imageService';
import { useProfileForm } from '@/hooks/profile/form/useProfileForm';
import { useAuthStore, useUserInfo } from '@/stores/auth';
import { Colors } from '@/theme/Color';
import { EditProfileModalProps } from '@/types/components';
import { Fruit, UserInfo } from '@/types/user';
import { logProfileUpdate } from '@/utilities/analytics';

import NameInput from './NameInput';
import ErrorMessage from '../ui/ErrorMessage';

const EditProfileModal = ({
	isVisible,
	onClose,
	isUploading,
	setIsUploading,
}: EditProfileModalProps) => {
	const userInfo = useUserInfo();
	const setUserInfo = useAuthStore((state) => state.setUserInfo);
	// Profile은 MainTabNavigator(탭 안)와 RootStackNavigator(탭 밖) 두 곳에 등록되어 있다.
	// useBottomTabBarHeight()는 탭 밖에서 호출되면 throw하므로, 컨텍스트를 직접 읽어 없으면 0으로 폴백한다.
	const bottomTabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;

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
		setValue('fruit', userInfo?.fruit ?? '');
		setValue('titleFirst', userInfo?.titleFirst ?? '');
		setValue('titleLast', userInfo?.titleLast ?? '');
		setValue('bio', userInfo?.bio ?? '');

		if (userInfo.photoURL) {
			setValue('originalImageUrl', userInfo.photoURL);
			setValue('image', { uri: userInfo.photoURL } as ImagePickerAsset); // UI 표시에 필요하므로 image에도 변환하여 추가
		}
	}, [userInfo]);

	const displayName = watch('displayName');
	const islandName = watch('islandName');
	const image = watch('image');
	const originalImageUrl = watch('originalImageUrl');
	const fruit = watch('fruit');
	const titleFirst = watch('titleFirst');
	const titleLast = watch('titleLast');
	const bio = watch('bio');

	const isDisplayNameValid = !errors.displayName && displayName.length > 0;
	const isIslandNameValid = !errors.islandName && islandName.length > 0;
	const isTitleValid = !errors.titleFirst && !errors.titleLast;
	const isBioValid = !errors.bio;

	const isValid = isDisplayNameValid && isIslandNameValid && isTitleValid && isBioValid;

	const handleClose = () => {
		reset();
		onClose();
	};

	const onSubmit = async () => {
		if (!userInfo || !isValid) return;

		const requestData: Record<string, string> = {};
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

			// 과일
			if (fruit !== (userInfo.fruit ?? '')) {
				requestData.fruit = fruit ?? '';
			}

			// 칭호
			if (titleFirst !== (userInfo.titleFirst ?? '')) {
				requestData.titleFirst = titleFirst ?? '';
			}
			if (titleLast !== (userInfo.titleLast ?? '')) {
				requestData.titleLast = titleLast ?? '';
			}

			// 한마디
			if (bio !== (userInfo.bio ?? '')) {
				requestData.bio = bio ?? '';
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
				logProfileUpdate(Object.keys(requestData));

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

	const onError = (e: FieldErrors) => {
		console.log(e);
	};

	const submitButton = (
		<Button
			disabled={!isValid || isUploading}
			color="white"
			size="md2"
			onPress={handleSubmit(onSubmit, onError)}
			testID="submitProfileButton"
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
				snapPoints={['95%', '100%']}
				title="프로필 수정"
				rightButton={submitButton}
				bodyStyle={[
					styles.bottomSheetBodyStyle,
					{ paddingBottom: bottomTabBarHeight },
				]}
			>
				{/* 스크롤 몸통은 Gorhom, 포커스 자동 스크롤은 keyboard-controller가 담당 */}
				<KeyboardAwareScrollView
					testID="editProfileScrollView"
					// 스크롤 구현체로 BottomSheetScrollView 주입(직접 쓰면 자동 스크롤 사라짐).
					// 캐스트: prop 타입과 Gorhom props 타입 불일치 회피(런타임 동작 동일)
					ScrollViewComponent={
						BottomSheetScrollView as unknown as ComponentType<ScrollViewProps>
					}
					// 입력을 키보드 툴바 높이 + 여백만큼 띄워 올림(툴바에 가려지는 것 방지)
					bottomOffset={KEYBOARD_TOOLBAR_HEIGHT + PADDING}
					style={styles.screen}
					// 키보드 여백은 이 컴포넌트가 전담 → 정적 PADDING만, 동적 패딩 금지
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
				>
					<View testID="editProfileContent" style={styles.container}>
						{/* 이미지 */}
						<Controller
							control={control}
							name="image"
							render={({ field: { value, onChange } }) => (
								<ProfileImageInput image={value} setImage={onChange} />
							)}
						/>

						<View testID="editProfileInfo" style={styles.info}>
							{/* 닉네임 */}
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
										InputComponent={BottomSheetTextInput}
									/>
								)}
							/>
							{/* 섬 이름 */}
							<Controller
								control={control}
								name="islandName"
								render={({ field: { value, onChange } }) => (
									<NameInput
										type="islandName"
										value={value}
										onChangeText={onChange}
										label="섬 이름"
										placeholder="섬 이름을 입력해주세요."
										InputComponent={BottomSheetTextInput}
									/>
								)}
							/>
							{/* 과일 */}
							<View style={styles.inputContainer}>
								<Text style={styles.label}>과일</Text>
								<View style={styles.fruitContainer}>
									{(Object.entries(FRUIT_IMAGES) as [Fruit, number][]).map(
										([name, imageUrl]) => (
											<TouchableOpacity
												key={name}
												onPress={() =>
													setValue('fruit', fruit === name ? '' : name)
												}
												style={[
													styles.fruitItem,
													fruit === name && styles.selectedFruitItem,
												]}
											>
												<Image
													source={imageUrl}
													style={styles.fruitImage}
												/>
											</TouchableOpacity>
										),
									)}
								</View>
							</View>

							{/* 칭호 */}
							<View style={styles.inputContainer}>
								<Text style={styles.label}>칭호</Text>
								<View style={styles.titleContainer}>
									<Controller
										control={control}
										name="titleFirst"
										render={({ field: { value, onChange } }) => (
											<BottomSheetTextInput
												value={value}
												onChangeText={onChange}
												placeholder="초면의"
												style={styles.titleInput}
											/>
										)}
									/>
									<Controller
										control={control}
										name="titleLast"
										render={({ field: { value, onChange } }) => (
											<BottomSheetTextInput
												value={value}
												onChangeText={onChange}
												placeholder="이주민"
												style={styles.titleInput}
											/>
										)}
									/>
								</View>
								{(errors.titleFirst?.message || errors.titleLast?.message) && (
									<ErrorMessage
										message={
											(errors.titleFirst?.message ||
												errors.titleLast?.message) as string
										}
									/>
								)}
							</View>

							{/* 한마디 */}
							<View style={styles.inputContainer}>
								<Text style={styles.label}>한마디</Text>
								<Controller
									control={control}
									name="bio"
									render={({ field: { value, onChange } }) => (
										<View style={styles.bioWrapper}>
											<BottomSheetTextInput
												testID="bioInput"
												value={value}
												onChangeText={onChange}
												placeholder="한마디를 적어주세요!"
												style={styles.bioInput}
												maxLength={20}
											/>
											<Text style={styles.bioCounter}>
												{(value ?? '').length}/20
											</Text>
										</View>
									)}
								/>
								{errors.bio?.message && (
									<ErrorMessage message={errors.bio.message as string} />
								)}
							</View>

							{/* 안내 문구 */}
							<View testID="profileInputGuidance" style={styles.messageContainer}>
								<FontAwesome name="leaf" color={Colors.brand.primary} size={14} />
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
		paddingTop: PADDING,
		paddingLeft: PADDING,
		paddingRight: 0,
	},
	screen: {
		flex: 1,
		backgroundColor: Colors.bg.primary,
	},
	scrollContent: {
		paddingRight: PADDING,
		paddingBottom: PADDING,
	},
	container: {
		flexShrink: 0,
		alignItems: 'center',
		gap: 4,
	},
	info: {
		flexShrink: 0,
		width: '90%',
	},
	messageContainer: {
		paddingHorizontal: 12,
		flexDirection: 'row',
		gap: 8,
	},
	infoText: {
		color: Colors.brand.primary,
		fontSize: FontSizes.sm,
		marginBottom: 16,
	},
	inputContainer: {
		marginBottom: 18,
	},
	label: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
		color: Colors.text.primary,
		marginBottom: 16,
	},
	fruitContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 8,
	},
	titleContainer: {
		flexDirection: 'row',
		gap: 12,
	},
	titleInput: {
		flex: 1,
		fontSize: FontSizes.md,
		padding: 12,
		borderWidth: 1,
		borderColor: Colors.bg.secondary,
		borderRadius: 8,
		backgroundColor: Colors.bg.secondary,
		textAlignVertical: 'center',
		height: 45,
	},
	fruitItem: {
		width: 52,
		height: 52,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.bg.secondary,
		borderRadius: 18,
	},
	selectedFruitItem: {
		backgroundColor: Colors.brand.primary,
	},
	fruitImage: {
		width: 36,
		height: 36,
		resizeMode: 'contain',
	},
	bioWrapper: {
		position: 'relative',
	},
	bioInput: {
		fontSize: FontSizes.md,
		paddingHorizontal: 12,
		paddingVertical: 18,
		paddingBottom: 32,
		borderWidth: 1,
		borderColor: Colors.bg.secondary,
		borderRadius: 8,
		backgroundColor: Colors.bg.secondary,
	},
	bioCounter: {
		position: 'absolute',
		bottom: 8,
		right: 12,
		fontSize: FontSizes.xs,
		color: Colors.text.tertiary,
	},
});
