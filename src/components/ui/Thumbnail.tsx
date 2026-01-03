import { Colors } from '@/constants/Color';
import { ThumabnailProps } from '@/types/components';
import React from 'react';
import { StyleSheet } from 'react-native';
import ImageWithFallback from './ImageWithFallback';

const Thumbnail = ({ previewImage }: ThumabnailProps) => {
	if (!previewImage) return null;

	return <ImageWithFallback uri={previewImage} style={styles.thumbnail} />;
};

export default Thumbnail;

const styles = StyleSheet.create({
	thumbnail: {
		width: 50,
		height: 50,
		borderRadius: 6,
		resizeMode: 'cover',
		borderWidth: 1,
		borderColor: Colors.border_gray,
	},
	emptyThumbnail: {
		backgroundColor: Colors.border_gray,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
