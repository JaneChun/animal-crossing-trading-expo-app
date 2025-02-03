import { ImagePickerAsset } from 'expo-image-picker';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage } from '../fbase';

export const uploadFiles = async ({
	images,
	directory,
}: {
	images: ImagePickerAsset[];
	directory: string;
}) => {
	try {
		const uploadPromises = images.map(async (image) => {
			const fileName = `${Date.now()}_${image.fileName || 'image.jpg'}`;
			const storageRef = ref(storage, `${directory}/${fileName}`);

			const response = await fetch(image.uri); // 이미지 URL을 fetch하여 Blob 변환
			const blob = await response.blob(); // Blob(바이너리) 형태로 변환

			await uploadBytes(storageRef, blob); // Firebase Storage에 Blob 파일 업로드
			return getDownloadURL(storageRef); // 업로드 후 다운로드 URL 반환
		});

		const downloadURLs = await Promise.all(uploadPromises);
		console.log('이미지 업로드 완료');
		return downloadURLs;
	} catch (error) {
		console.log('이미지 업로드 실패:', error);
		return [];
	}
};
