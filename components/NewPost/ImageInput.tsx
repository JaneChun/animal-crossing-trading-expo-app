import { useImagePicker } from '@/hooks/shared/useImagePicker';
import { ImageInputProps } from '@/types/components';
import React from 'react';
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
	const { pickImage } = useImagePicker({ multiple: true });

	const addImage = async () => {
		const newImages = await pickImage();

		if (newImages) {
			setImages((currentImages) => [...currentImages, ...newImages]);
		}
	};

	const deleteImage = (uri: string) => {
		setImages((currentImages) =>
			currentImages.filter((image) => image.uri !== uri),
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
