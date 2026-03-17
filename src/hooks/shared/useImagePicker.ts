import {
	ImagePickerAsset,
	launchCameraAsync,
	launchImageLibraryAsync,
	useCameraPermissions,
	useMediaLibraryPermissions,
} from 'expo-image-picker';

import { showToast } from '@/components/ui/Toast';
import { UseImagePickerOptions } from '@/types/image';

export const useImagePicker = (options: UseImagePickerOptions = { multiple: false }) => {
	const [, requestPermission, getPermission] = useMediaLibraryPermissions();
	const [, requestCameraPermission, getCameraPermission] = useCameraPermissions();

	const verifyPhotosPermissions = async (): Promise<boolean> => {
		let currentPermission = await getPermission();
		if (currentPermission.status === 'undetermined') {
			currentPermission = await requestPermission();
		}
		if (currentPermission.status === 'denied') {
			showToast('warn', '이미지를 업로드하려면 사진 접근 권한이 필요합니다.');
			return false;
		}
		return currentPermission.status === 'granted';
	};

	const verifyCameraPermissions = async (): Promise<boolean> => {
		let currentPermission = await getCameraPermission();
		if (currentPermission.status === 'undetermined') {
			currentPermission = await requestCameraPermission();
		}
		if (currentPermission.status === 'denied') {
			showToast('warn', '카메라를 사용하려면 카메라 접근 권한이 필요합니다.');
			return false;
		}
		return currentPermission.status === 'granted';
	};

	const pickImage = async (selectionLimit: number) => {
		const hasPermission = await verifyPhotosPermissions();
		if (!hasPermission) return null;

		const limit =
			selectionLimit != null // selectionLimit이 있으면 selectionLimit
				? selectionLimit
				: options.multiple // 없으면 multiple 모드시 10장, 아니면 1장
					? 10
					: 1;

		const result = await launchImageLibraryAsync({
			mediaTypes: 'images',
			allowsMultipleSelection: options.multiple,
			aspect: [1, 1],
			quality: 1,
			orderedSelection: true,
			selectionLimit: limit,
			// @ts-expect-error: iCloud 사진 선택을 위해 필요한 옵션이지만, expo-image-picker의 타입 정의에는 누락되어 있음
			allowNetworkAccess: true,
		});

		if (result.canceled) return null;

		return result.assets as ImagePickerAsset[];
	};

	const takePhoto = async () => {
		const hasPermission = await verifyCameraPermissions();
		if (!hasPermission) return null;

		const result = await launchCameraAsync({
			mediaTypes: 'images',
			aspect: [1, 1],
			quality: 1,
		});

		if (result.canceled) return null;

		return result.assets as ImagePickerAsset[];
	};

	return { pickImage, takePhoto };
};
