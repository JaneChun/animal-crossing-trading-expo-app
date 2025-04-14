import { Colors } from '@/constants/Color';
import { ThumabnailProps } from '@/types/components';
import React from 'react';
import { StyleSheet } from 'react-native';
import ImageWithFallback from './ImageWithFallback';

const Thumbnail = ({ previewImage }: ThumabnailProps) => {
	return <ImageWithFallback uri={previewImage} style={styles.thumbnail} />;
};

export default Thumbnail;

const styles = StyleSheet.create({
	thumbnail: {
		width: 42,
		height: 42,
		borderRadius: 6,
		resizeMode: 'cover',
	},
	emptyThumbnail: {
		backgroundColor: Colors.border_gray,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
