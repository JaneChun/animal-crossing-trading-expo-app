import { ImageWithFallbackProps } from '@/types/components';
import { useMemo } from 'react';
import FastImage from 'react-native-fast-image';

const ImageWithFallback = ({
	uri,
	fallbackSource,
	style,
	priority = 'normal',
}: ImageWithFallbackProps) => {
	const DEFAULT_FALLBACK = useMemo(() => require('../../assets/images/empty_image.png'), []);

	const priorityLevel = useMemo(() => {
		const priorities = {
			low: FastImage.priority.low,
			normal: FastImage.priority.normal,
			high: FastImage.priority.high,
		};

		return priorities[priority] || FastImage.priority.normal;
	}, [priority]);

	return (
		<FastImage
			source={{
				uri,
				priority: priorityLevel,
				cache: FastImage.cacheControl.immutable, // URL이 변경되는 경우에만 업데이트
			}}
			defaultSource={fallbackSource ? fallbackSource : DEFAULT_FALLBACK}
			style={style}
		/>
	);
};

export default ImageWithFallback;
