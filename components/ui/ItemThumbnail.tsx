import { Colors } from '@/constants/Color';
import { ItemThumabnailProps } from '@/types/components';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const ItemThumbnail = ({ previewImage, itemLength }: ItemThumabnailProps) => {
	return (
		<>
			<View style={styles.container}>
				{previewImage ? (
					<>
						<Image
							style={[styles.thumbnail, { padding: 2 }]}
							source={{
								uri: previewImage,
							}}
						/>
						<View style={styles.badgeContainer}>
							{itemLength && <Text style={styles.badgeText}>{itemLength}</Text>}
						</View>
					</>
				) : (
					<Image
						style={styles.thumbnail}
						source={require('../../assets/images/empty_image.png')}
					/>
				)}
			</View>
		</>
	);
};

export default ItemThumbnail;

const styles = StyleSheet.create({
	container: {},
	thumbnail: {
		width: 42,
		height: 42,
		borderRadius: 21,
		resizeMode: 'cover',
		borderWidth: 1,
		borderColor: Colors.border_gray,
	},
	badgeContainer: {
		position: 'absolute',
		bottom: -4,
		right: -4,
		width: 18,
		height: 18,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.border_gray,
		borderColor: Colors.primary,
	},
	badgeText: {
		color: Colors.font_gray,
		fontSize: 12,
		fontWeight: 500,
	},
	emptyThumbnail: {
		backgroundColor: Colors.border_gray,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
