import { ImagePickerAsset } from 'expo-image-picker';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

import AddImageButton from '@/components/ui/AddImageButton';
import ImagePreview from '@/components/ui/ImagePreview';
import { showToast } from '@/components/ui/Toast';
import { MAX_IMAGES } from '@/constants/post';
import { useImagePicker } from '@/hooks/shared/useImagePicker';
import { ImageInputProps } from '@/types/components';
import { compressImages } from '@/utilities/compressImage';

const ImageInput = ({ images, setImages, containerStyle, labelStyle }: ImageInputProps) => {
	const { pickImage } = useImagePicker({ multiple: true });
	const [isLoading, setIsLoading] = useState(false);

	const addImage = async () => {
		const remaining = MAX_IMAGES - images.length;
		if (remaining <= 0) {
			showToast('warn', '이미지는 최대 10장까지 첨부할 수 있어요.');
			return;
		}

		const newImages = await pickImage(remaining);
		if (!newImages || newImages.length === 0) {
			return;
		}

		setIsLoading(true);
		try {
			const compressed = await compressImages(newImages);
			setImages([...images, ...compressed]);
		} catch (error) {
			console.warn('Image compression failed:', error);
			setImages([...images, ...newImages]); // 원본이라도 추가
		} finally {
			setIsLoading(false);
		}
	};

	const deleteImage = (uri: string) => {
		const filtered: ImagePickerAsset[] = images.filter((image) => image.uri !== uri);
		setImages(filtered);
	};

	return (
		<View style={containerStyle}>
			<Text style={labelStyle}>사진</Text>

			<FlatList
				data={images}
				keyExtractor={(image) => image.uri}
				horizontal
				style={styles.flatListContainer}
				ListHeaderComponent={
					<AddImageButton
						count={images.length}
						totalCount={10}
						onPress={addImage}
						isLoading={isLoading}
					/>
				}
				renderItem={({ item: image }) => (
					<ImagePreview uri={image.uri} onDelete={deleteImage} />
				)}
			/>
		</View>
	);
};

export default ImageInput;

const styles = StyleSheet.create({
	flatListContainer: {
		paddingBottom: 16,
	},
});
