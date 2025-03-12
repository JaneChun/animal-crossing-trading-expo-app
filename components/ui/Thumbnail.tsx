import { Colors } from '@/constants/Color';
import { ThumabnailProps } from '@/types/components';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

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
				<View style={[styles.thumbnail, styles.emptyThumbnail]}>
					<FontAwesome name='leaf' color={Colors.font_light_gray} size={18} />
				</View>
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
