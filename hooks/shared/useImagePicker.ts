import { showToast } from '@/components/ui/Toast';
import { UseImagePickerOptions } from '@/types/image';
import {
	ImagePickerAsset,
	launchImageLibraryAsync,
	useMediaLibraryPermissions,
} from 'expo-image-picker';

export const useImagePicker = (
	options: UseImagePickerOptions = { multiple: false },
) => {
	const [, requestPermission, getPermission] = useMediaLibraryPermissions();

	const verifyPermissions = async (): Promise<boolean> => {
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

	const pickImage = async (selectionLimit: number) => {
		const hasPermission = await verifyPermissions();
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
			quality: 0,
			selectionLimit: limit,
		});

		if (result.canceled) return null;

		return result.assets as ImagePickerAsset[];
	};

	return { pickImage };
};
