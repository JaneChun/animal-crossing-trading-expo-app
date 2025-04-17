import {
	deleteObjectFromStorage,
	uploadObjectToStorage,
} from '@/firebase/services/imageService';
import { Collection } from '@/types/post';
import { ImagePickerAsset } from 'expo-image-picker';

//  새 이미지 업로드 + 기존 이미지 삭제 작업
// handleImageUpload는 결과적으로 사용할 이미지 URL 배열을 반환
export const handleImageUpload = async ({
	collectionName,
	images,
	originalImageUrls,
}: {
	collectionName: Collection;
	images: ImagePickerAsset[];
	originalImageUrls: string[];
}): Promise<string[]> => {
	const { newImages, deletedImageUrls } = getFilteredImages({
		images,
		originalImageUrls,
	});
	let uploadedImageUrls: string[] = [];

	// 새로운 이미지 처리: 스토리지에 업로드
	if (newImages.length) {
		uploadedImageUrls = await uploadObjectToStorage({
			directory: collectionName,
			images: newImages,
		});
	}

	// 삭제된 이미지 처리: 스토리지에서 삭제
	if (deletedImageUrls.length) {
		await Promise.all(deletedImageUrls.map(deleteObjectFromStorage));
	}

	// 최종적으로 DB에 저장할 imageUrls: 기존 이미지 + 새 이미지 - 삭제된 이미지
	const imageUrls = [...originalImageUrls, ...uploadedImageUrls].filter(
		(url) => !deletedImageUrls.includes(url),
	);

	return imageUrls;
};

// images와 originalImageUrls를 비교하여 기존 이미지, 새로 추가된 이미지, 삭제된 이미지 구분
const getFilteredImages = ({
	images,
	originalImageUrls,
}: {
	images: ImagePickerAsset[];
	originalImageUrls: string[];
}) => {
	const newImages: ImagePickerAsset[] = images.filter(
		({ uri }) => !originalImageUrls.includes(uri),
	);

	const deletedImageUrls: string[] = originalImageUrls.filter(
		(url) => !images.some(({ uri }) => uri === url),
	);
	return { newImages, deletedImageUrls };
};
