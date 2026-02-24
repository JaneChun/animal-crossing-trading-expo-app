import { storage } from '@/config/firebase';
import { StorageCollection } from '@/types/image';
import { compressImage } from '@/utilities/compressImage';
import * as Crypto from 'expo-crypto';
import { ImagePickerAsset } from 'expo-image-picker';
import { deleteObject, getDownloadURL, getMetadata, ref, uploadBytes } from 'firebase/storage';
import firestoreRequest from '@/firebase/core/firebaseInterceptor';

const UPLOAD_TIMEOUT_MS = 30_000;
const PIPELINE_CONCURRENT_LIMIT = 3;

// Promise에 시간 제한을 적용하는 wrapper 함수
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error(`Upload timed out after ${ms}ms`)), ms);
		promise.then(resolve, reject).finally(() => clearTimeout(timer));
	});
};

const uploadImage = async (
	image: ImagePickerAsset,
	directory: StorageCollection,
): Promise<string> => {
	const fileName = `${Date.now()}_${Crypto.randomUUID()}_${image.fileName}`;
	const storageRef = ref(storage, `${directory}/${fileName}`);

	const response = await fetch(image.uri); // 이미지 URL을 fetch하여 Blob 변환
	const blob = await response.blob(); // Blob(바이너리) 형태로 변환

	// Firebase Storage에 Blob 파일 업로드
	await uploadBytes(storageRef, blob, {
		contentType: image.mimeType || 'image/jpeg',
	});

	return getDownloadURL(storageRef); // 업로드 후 다운로드 URL 반환
};

const compressAndUpload = async (
	image: ImagePickerAsset,
	directory: StorageCollection,
): Promise<string> => {
	const compressed = await compressImage(image);
	return withTimeout(uploadImage(compressed, directory), UPLOAD_TIMEOUT_MS);
};

export const uploadObjectToStorage = async ({
	images,
	directory,
}: {
	images: ImagePickerAsset[];
	directory: StorageCollection;
}): Promise<string[]> => {
	return firestoreRequest(
		'Storage 이미지 업로드',
		async () => {
			const downloadURLs: string[] = [];

			try {
				for (let i = 0; i < images.length; i += PIPELINE_CONCURRENT_LIMIT) {
					const batch = images.slice(i, i + PIPELINE_CONCURRENT_LIMIT);
					const urls = await Promise.all(
						batch.map((image) => compressAndUpload(image, directory)),
					);
					downloadURLs.push(...urls);
				}

				return downloadURLs;
			} catch (error) {
				await Promise.all(downloadURLs.map((url) => deleteObjectFromStorage(url)));
				throw error;
			}
		},
		{ throwOnError: true },
	);
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
