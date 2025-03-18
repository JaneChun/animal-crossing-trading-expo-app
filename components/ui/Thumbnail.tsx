import { Colors } from '@/constants/Color';
import { ThumabnailProps } from '@/types/components';
import React from 'react';
import { Image, StyleSheet } from 'react-native';

const Thumbnail = ({ previewImage }: ThumabnailProps) => {
	return (
		<>
			{previewImage ? (
				<Image
					style={styles.thumbnail}
					source={{
						uri: previewImage,
					}}
				/>
			) : (
				<Image
					style={styles.thumbnail}
					source={require('../../assets/images/empty_image.png')}
				/>
			)}
		</>
	);
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
