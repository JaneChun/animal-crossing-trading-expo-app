import { Colors } from '@/constants/Color';
import { MaterialIcons } from '@expo/vector-icons';
import {
	ImagePickerAsset,
	launchImageLibraryAsync,
	useMediaLibraryPermissions,
} from 'expo-image-picker';
import React, { Dispatch, SetStateAction } from 'react';
import {
	Alert,
	Image,
	Keyboard,
	StyleProp,
	StyleSheet,
	Text,
	TextStyle,
	TouchableOpacity,
	View,
	ViewStyle,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

type ImageInputProps = {
	images: ImagePickerAsset[];
	setImages: Dispatch<SetStateAction<ImagePickerAsset[]>>;
	containerStyle?: StyleProp<ViewStyle>;
	labelStyle?: StyleProp<TextStyle>;
};

const ImageInput = ({
	images,
	setImages,
	containerStyle,
	labelStyle,
}: ImageInputProps) => {
	const [, requestPermission, getPermission] = useMediaLibraryPermissions();

	const verifyPermissions = async () => {
		let currentPermission = await getPermission();

		if (currentPermission.status === 'undetermined') {
			currentPermission = await requestPermission();
		}

		if (currentPermission.status === 'denied') {
			Alert.alert(
				'권한 필요',
				'이미지를 업로드하려면 사진 접근 권한이 필요합니다.',
			);
			return false;
		}
		return currentPermission.status === 'granted';
	};

	const pickImages = async () => {
		Keyboard.dismiss(); // 키보드 닫기

		const hasPermission = await verifyPermissions(); // 사진 권한 확인
		if (!hasPermission) {
			return;
		}

		let result = await launchImageLibraryAsync({
			mediaTypes: 'images',
			allowsMultipleSelection: true,
			selectionLimit: 10,
			aspect: [1, 1],
			quality: 0,
		});

		if (!result.canceled) {
			setImages(result.assets);
		}
	};

	const deleteImage = (assetId: string) => {
		setImages((currentImages) =>
			currentImages.filter((image) => image.assetId !== assetId),
		);
	};

	return (
		<View style={containerStyle}>
			<Text style={labelStyle}>사진</Text>

			<FlatList
				data={images}
				horizontal
				style={styles.flatListContainer}
				ListHeaderComponent={
					<TouchableOpacity
						style={[styles.addImageButtonContainer, styles.imageContainer]}
						activeOpacity={0.5}
						onPress={pickImages}
					>
						<MaterialIcons
							name='photo-library'
							color={Colors.font_gray}
							size={48}
						/>
						<View style={styles.textContainer}>
							<Text style={styles.currentCountText}>{images.length}</Text>
							<Text style={styles.totalCountText}> / 10</Text>
						</View>
					</TouchableOpacity>
				}
				renderItem={({ item: image }) => (
					<>
						<View key={image.assetId}>
							<TouchableOpacity
								style={styles.deleteButton}
								onPress={() => deleteImage(image.assetId!)}
								activeOpacity={0.7}
							>
								<Text style={styles.deleteButtonIcon}>✕</Text>
							</TouchableOpacity>
							<Image
								source={{ uri: image.uri }}
								style={styles.imageContainer}
							/>
						</View>
					</>
				)}
			></FlatList>
		</View>
	);
};

export default ImageInput;

const styles = StyleSheet.create({
	flatListContainer: {
		paddingBottom: 16,
	},
	imageContainer: {
		width: 100,
		height: 100,
		margin: 6,
		borderRadius: 12,
	},
	addImageButtonContainer: {
		padding: 8,
		backgroundColor: Colors.base,
		borderWidth: 1,
		borderColor: Colors.border_gray,
		justifyContent: 'center',
		alignItems: 'center',
	},
	deleteButton: {
		position: 'absolute',
		zIndex: 2,
		top: 0,
		right: 0,
		backgroundColor: 'black',
		borderRadius: 12,
		width: 24,
		height: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	deleteButtonIcon: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
	textContainer: {
		fontSize: 14,
		flexDirection: 'row',
		marginTop: 4,
	},
	currentCountText: {
		color: Colors.primary,
		fontWeight: 'bold',
	},
	totalCountText: {
		color: Colors.font_gray,
		fontWeight: 'semibold',
	},
});
