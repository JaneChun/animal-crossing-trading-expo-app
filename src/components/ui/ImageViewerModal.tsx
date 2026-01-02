import { ImageViewerModalProps } from '@/types/components';
import React from 'react';
import ImageViewing from 'react-native-image-viewing';

const ImageViewerModal = ({
	visible,
	images,
	initialIndex = 0,
	onRequestClose,
}: ImageViewerModalProps) => {
	const formattedImages = images.map((uri) => ({ uri }));

	return (
		<ImageViewing
			images={formattedImages}
			imageIndex={initialIndex}
			visible={visible}
			onRequestClose={onRequestClose}
			presentationStyle='fullScreen'
			swipeToCloseEnabled
			doubleTapToZoomEnabled
		/>
	);
};

export default ImageViewerModal;
