import { Colors } from '@/constants/Color';
import { ItemThumabnailProps } from '@/types/components';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const ItemThumbnail = ({ previewImage, itemLength }: ItemThumabnailProps) => {
	return (
		<>
			{previewImage ? (
				<View style={styles.container}>
					<Image
						style={styles.thumbnail}
						source={{
							uri: previewImage,
						}}
					/>
					<View style={styles.badgeContainer}>
						{itemLength && (
							<Text style={styles.badgeText}>{itemLength - 1}</Text>
						)}
					</View>
				</View>
			) : (
				<View style={[styles.thumbnail, styles.emptyThumbnail]}>
					<FontAwesome name='leaf' color={Colors.font_light_gray} size={18} />
				</View>
			)}
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
		padding: 2,
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
