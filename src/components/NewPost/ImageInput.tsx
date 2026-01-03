import { MAX_IMAGES } from '@/constants/post';
import { useImagePicker } from '@/hooks/shared/useImagePicker';
import { ImageInputProps } from '@/types/components';
import { ImagePickerAsset } from 'expo-image-picker';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import AddImageButton from '@/components/ui/AddImageButton';
import ImagePreview from '@/components/ui/ImagePreview';
import { showToast } from '@/components/ui/Toast';

const ImageInput = ({
	images,
	setImages,
	containerStyle,
	labelStyle,
}: ImageInputProps) => {
	const { pickImage } = useImagePicker({ multiple: true });

	const addImage = async () => {
		const remaining = MAX_IMAGES - images.length;
		if (remaining <= 0) {
			showToast('warn', '이미지는 최대 10장까지 첨부할 수 있어요.');
			return;
		}

		const newImages: ImagePickerAsset[] | null = await pickImage(remaining);
		if (!newImages || newImages.length === 0) return;

		setImages([...images, ...newImages]);
	};

	const deleteImage = (uri: string) => {
		const filtered: ImagePickerAsset[] = images.filter(
			(image) => image.uri !== uri,
		);
		setImages(filtered);
	};

	return (
		<View style={containerStyle}>
			<Text style={labelStyle}>사진</Text>

			<FlatList
				data={images}
				horizontal
				style={styles.flatListContainer}
				ListHeaderComponent={
					<AddImageButton
						count={images.length}
						totalCount={10}
						onPress={addImage}
					/>
				}
				renderItem={({ item: image }) => (
					<ImagePreview uri={image.uri} onDelete={deleteImage} />
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
});
