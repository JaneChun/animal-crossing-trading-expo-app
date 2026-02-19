import { ImagePickerAsset } from 'expo-image-picker';

export type StorageCollection = 'Boards' | 'Communities' | 'Users' | 'Chats';

export interface UploadedImage {
	uri: string;
}

//  기기에서 업로드한 로컬 이미지 객체 | 서버에서 불러온 이미지 URL 담은 객체
export type ImageType = ImagePickerAsset | UploadedImage;

// utilities/handleImageUpload.ts
export type FilteredImages = {
	newImages: ImagePickerAsset[];
	deletedImageUrls: string[];
};

export type HandleImageUploadParams = {
	collectionName: StorageCollection;
	images: ImagePickerAsset[];
	originalImageUrls: string[];
};

export type GetFilteredImagesParams = {
	images: ImagePickerAsset[];
	originalImageUrls: string[];
};

// hooks/shared/useImagePicker.ts
export type UseImagePickerOptions = {
	multiple?: boolean;
};
