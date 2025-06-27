import { MAX_IMAGES } from '@/constants/post';
import { useImagePicker } from '@/hooks/shared/useImagePicker';
import { ImageInputProps } from '@/types/components';
import { ImagePickerAsset } from 'expo-image-picker';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import AddImageButton from '../ui/AddImageButton';
import ImagePreview from '../ui/ImagePreview';

const ImageInput = ({
	images,
	setImages,
	containerStyle,
	labelStyle,
}: ImageInputProps) => {
	const { watch } = useFormContext();
	const { pickImage } = useImagePicker({ multiple: true });

	const addImage = async () => {
		const newImages: ImagePickerAsset[] | null = await pickImage();
		if (!newImages) return;

		const allowed = Math.min(newImages.length, MAX_IMAGES - images.length);
		if (allowed <= 0) return;

		setImages([...images, ...newImages.slice(0, allowed)]);
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
