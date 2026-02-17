import { storage } from '@/config/firebase';
import { StorageCollection } from '@/types/image';
import { compressImages } from '@/utilities/compressImage';
import * as Crypto from 'expo-crypto';
import { ImagePickerAsset } from 'expo-image-picker';
import { deleteObject, getDownloadURL, getMetadata, ref, uploadBytes } from 'firebase/storage';
import firestoreRequest from '@/firebase/core/firebaseInterceptor';

export const uploadObjectToStorage = async ({
	images,
	directory,
}: {
	images: ImagePickerAsset[];
	directory: StorageCollection;
}): Promise<string[]> => {
	return firestoreRequest('Storage 이미지 업로드', async () => {
		const compressedImages = await compressImages(images);

		const uploadPromises = compressedImages.map(async (image) => {
			const fileName = `${Date.now()}_${Crypto.randomUUID()}_${image.fileName}`;
			const storageRef = ref(storage, `${directory}/${fileName}`);

			const response = await fetch(image.uri); // 이미지 URL을 fetch하여 Blob 변환
			const blob = await response.blob(); // Blob(바이너리) 형태로 변환

			// Firebase Storage에 Blob 파일 업로드
			await uploadBytes(storageRef, blob, {
				contentType: image.mimeType || 'image/webp',
			});

			return getDownloadURL(storageRef); // 업로드 후 다운로드 URL 반환
		});

		const downloadURLs = await Promise.all(uploadPromises);

		return downloadURLs.filter((url) => url !== null);
	});
};

export const deleteObjectFromStorage = async (imageUrl: string): Promise<void> => {
	return firestoreRequest('Storage 이미지 삭제', async () => {
		const imageRef = ref(storage, imageUrl);
		await deleteObject(imageRef);
	});
};

export const checkIfObjectExistsInStorage = async (imageUrl: string) => {
	try {
		const imageRef = ref(storage, imageUrl);
		await getMetadata(imageRef);

		return true;
	} catch (e) {
		return false;
	}
};
