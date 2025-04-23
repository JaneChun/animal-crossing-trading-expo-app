import { ImageType } from '@/types/image';
import { ImagePickerAsset } from 'expo-image-picker';

export const isLocalImage = (image: ImageType): image is ImagePickerAsset => {
	return 'assetId' in image;
};

export const isUploadedImage = (image: ImageType): image is { uri: string } => {
	return typeof image.uri === 'string' && !('assetId' in image);
};
