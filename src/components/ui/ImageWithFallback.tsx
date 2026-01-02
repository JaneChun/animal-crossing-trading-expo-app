import { ImageWithFallbackProps } from '@/types/components';
import { useMemo } from 'react';
import FastImage from 'react-native-fast-image';

const ImageWithFallback = ({
	uri,
	localSource,
	fallbackSource,
	style,
	priority = 'normal',
	resizeMode = 'cover',
}: ImageWithFallbackProps) => {
	const DEFAULT_FALLBACK = useMemo(() => require('../../../assets/images/empty_image.png'), []);

	const priorityLevel = useMemo(() => {
		const priorities = {
			low: FastImage.priority.low,
			normal: FastImage.priority.normal,
			high: FastImage.priority.high,
		};

		return priorities[priority] || FastImage.priority.normal;
	}, [priority]);

	const imageSource = useMemo(() => {
		// 로컬 이미지
		if (localSource) {
			return localSource;
		}

		// 원격 이미지
		if (uri) {
			return {
				uri,
				priority: priorityLevel,
				cache: FastImage.cacheControl.immutable, // URL이 변경되는 경우에만 업데이트
			};
		}

		// 둘 다 없으면 기본 이미지
		return fallbackSource || DEFAULT_FALLBACK;
	}, [uri, localSource, priorityLevel, fallbackSource, DEFAULT_FALLBACK]);

	return (
		<FastImage
			source={imageSource}
			defaultSource={fallbackSource ? fallbackSource : DEFAULT_FALLBACK}
			style={style}
			resizeMode={resizeMode}
		/>
	);
};

export default ImageWithFallback;
