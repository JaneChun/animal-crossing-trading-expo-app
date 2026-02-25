import { storage } from '@/config/firebase';
import { StorageCollection } from '@/types/image';
import * as Crypto from 'expo-crypto';
import { ImagePickerAsset } from 'expo-image-picker';
import { deleteObject, getDownloadURL, getMetadata, ref, uploadBytes } from 'firebase/storage';
import firestoreRequest from '@/firebase/core/firebaseInterceptor';

const UPLOAD_TIMEOUT_MS = 30_000;
const UPLOAD_BATCH_SIZE = 3;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1_000;

// Promise에 시간 제한을 적용하는 wrapper 함수
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error(`Upload timed out after ${ms}ms`)), ms);
		promise.then(resolve, reject).finally(() => clearTimeout(timer));
	});
};

// 실패한 작업을 지수 백오프(exponential backoff)로 재시도하는 wrapper 함수
const withRetry = async <T>(
	fn: () => Promise<T>,
	maxRetries: number,
	baseDelayMs: number,
): Promise<T> => {
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			const isLastAttempt = attempt === maxRetries;
			if (isLastAttempt) throw error;

			const delay = baseDelayMs * 2 ** attempt;
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}
	throw new Error('Unreachable');
};

const uploadImage = async (
	image: ImagePickerAsset,
	directory: StorageCollection,
): Promise<string> => {
	// 업로드 실패 시 재시도
	return withRetry(
		async () => {
			const response = await fetch(image.uri);
			const blob = await response.blob();

			const fileName = `${Date.now()}_${Crypto.randomUUID()}_${image.fileName ?? 'image.jpeg'}`;
			const storageRef = ref(storage, `${directory}/${fileName}`);

			await withTimeout(
				uploadBytes(storageRef, blob, { contentType: image.mimeType || 'image/jpeg' }),
				UPLOAD_TIMEOUT_MS,
			);

			return getDownloadURL(storageRef);
		},
		MAX_RETRIES,
		RETRY_BASE_DELAY_MS,
	);
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
				for (let i = 0; i < images.length; i += UPLOAD_BATCH_SIZE) {
					const batch = images.slice(i, i + UPLOAD_BATCH_SIZE);
					const urls = await Promise.all(
						batch.map((image) => uploadImage(image, directory)),
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
