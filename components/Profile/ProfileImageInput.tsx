import { Colors } from '@/constants/Color';
import { ProfileImageInputProps } from '@/types/components';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Entypo } from '@expo/vector-icons';
import {
	launchImageLibraryAsync,
	useMediaLibraryPermissions,
} from 'expo-image-picker';
import {
	Image,
	Keyboard,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { showToast } from '../ui/Toast';

const ProfileImageInput = ({ image, setImage }: ProfileImageInputProps) => {
	const [, requestPermission, getPermission] = useMediaLibraryPermissions();
	const { showActionSheetWithOptions } = useActionSheet();

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

	const verifyPermissions = async () => {
		let currentPermission = await getPermission();

		if (currentPermission.status === 'undetermined') {
			currentPermission = await requestPermission();
		}

		if (currentPermission.status === 'denied') {
			showToast('warn', '이미지를 업로드하려면 사진 접근 권한이 필요합니다.');
			return false;
		}
		return currentPermission.status === 'granted';
	};

	const pickImage = async () => {
		Keyboard.dismiss(); // 키보드 닫기

		const hasPermission = await verifyPermissions(); // 사진 권한 확인
		if (!hasPermission) {
			return;
		}

		const result = await launchImageLibraryAsync({
			mediaTypes: 'images',
			aspect: [1, 1],
			quality: 0,
		});

		if (!result.canceled) {
			setImage(result.assets[0]);
		}
	};

	const deleteImage = async () => {
		setImage(null);
	};

	return (
		<TouchableOpacity
			style={styles.imageContainer}
			activeOpacity={0.8}
			onPress={showImageEditOptions}
		>
			{image?.uri ? (
				<Image source={{ uri: image?.uri }} style={styles.image} />
			) : (
				<Image
					source={require('../../assets/images/empty_profile_image.png')}
					style={styles.image}
				/>
			)}
			<View style={[styles.image, styles.imageEditIconContainer]}>
				<View style={styles.imageEditIcon}>
					<Entypo name='camera' size={16} color={Colors.font_gray} />
				</View>
			</View>
		</TouchableOpacity>
	);
};

export default ProfileImageInput;

const styles = StyleSheet.create({
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
	emptyImage: {
		backgroundColor: Colors.border_gray,
		justifyContent: 'center',
		alignItems: 'center',
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
});
