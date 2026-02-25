import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { ImagePickerAsset } from 'expo-image-picker';

const MAX_DIMENSION = 1200;
const COMPRESS_QUALITY = 0.7;

const getJpegFileName = (originalFileName?: string | null): string => {
	if (!originalFileName) return 'image.jpeg';
	const nameWithoutExt = originalFileName.replace(/\.[^.]+$/, '');
	return `${nameWithoutExt || 'image'}.jpeg`;
};

const getResizeDimensions = (
	width: number,
	height: number,
): { width: number } | { height: number } | null => {
	if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
		return null;
	}

	if (width >= height) {
		return { width: MAX_DIMENSION };
	}

	return { height: MAX_DIMENSION };
};

export const compressImage = async (image: ImagePickerAsset): Promise<ImagePickerAsset> => {
	try {
		const { width, height } = image;
		const resize = getResizeDimensions(width, height);

		const context = ImageManipulator.manipulate(image.uri);

		if (resize) {
			context.resize(resize);
		}

		const imageRef = await context.renderAsync();

		const result = await imageRef.saveAsync({
			compress: COMPRESS_QUALITY,
			format: SaveFormat.JPEG,
		});

		return {
			...image,
			uri: result.uri,
			width: result.width,
			height: result.height,
			fileName: getJpegFileName(image.fileName),
			mimeType: 'image/jpeg',
		};
	} catch (error) {
		console.log('Image compression failed, using original:', error);
		return image;
	}
};

export const compressImages = async (images: ImagePickerAsset[]): Promise<ImagePickerAsset[]> => {
	const CONCURRENT_LIMIT = 3;
	const results: ImagePickerAsset[] = [];

	for (let i = 0; i < images.length; i += CONCURRENT_LIMIT) {
		const batch = images.slice(i, i + CONCURRENT_LIMIT);
		const compressed = await Promise.all(batch.map(compressImage));
		results.push(...compressed);
	}

	return results;
};
