import { useActionSheet } from '@expo/react-native-action-sheet';
import { Entypo } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { useImagePicker } from '@/hooks/shared/useImagePicker';
import { Colors } from '@/theme/Color';
import { ProfileImageInputProps } from '@/types/components';
import { compressImage } from '@/utilities/compressImage';
import { isLocalImage } from '@/utilities/typeGuards/imageGuards';
import emptyProfileImage from '@assets/images/empty_profile_image.png';

const ProfileImageInput = ({ image, setImage }: ProfileImageInputProps) => {
	const { pickImage } = useImagePicker({ multiple: false });
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
					addImage();
				} else if (selectedIndex === 1) {
					deleteImage();
				}
			},
		);
	};

	const addImage = async () => {
		const newImages = await pickImage(1);

		if (newImages && isLocalImage(newImages[0])) {
			const compressed = await compressImage(newImages[0]);
			setImage(compressed);
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
			<ImageWithFallback
				uri={image?.uri}
				fallbackSource={emptyProfileImage}
				style={styles.image}
			/>

			<View style={[styles.image, styles.imageEditIconContainer]}>
				<View style={styles.imageEditIcon}>
					<Entypo name="camera" size={16} color={Colors.text.tertiary} />
				</View>
			</View>
		</TouchableOpacity>
	);
};

export default ProfileImageInput;

const styles = StyleSheet.create({
	imageContainer: {
		position: 'relative',
		marginTop: 16,
		marginBottom: 24,
	},
	image: {
		width: 100,
		height: 100,
		borderRadius: 50,
	},
	emptyImage: {
		backgroundColor: Colors.border.default,
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
		backgroundColor: Colors.bg.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
