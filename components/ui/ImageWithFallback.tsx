import { ImagePriority, ImageWithFallbackProps } from '@/types/components';
import FastImage from 'react-native-fast-image';

const ImageWithFallback = ({
	uri,
	fallbackSource,
	style,
	priority,
}: ImageWithFallbackProps) => {
	const getPriority = (level: ImagePriority) => {
		switch (level) {
			case 'low':
				return FastImage.priority.low;
			case 'high':
				return FastImage.priority.high;
			case 'normal':
				return FastImage.priority.normal;
			default:
				return FastImage.priority.normal;
		}
	};

	return (
		<FastImage
			source={{
				uri,
				priority: priority ? getPriority(priority) : FastImage.priority.normal,
			}}
			defaultSource={
				fallbackSource
					? fallbackSource
					: require('../../assets/images/empty_image.png')
			}
			style={style}
		/>
	);
};

export default ImageWithFallback;
