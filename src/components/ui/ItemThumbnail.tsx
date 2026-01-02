import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { ItemThumabnailProps } from '@/types/components';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ImageWithFallback from './ImageWithFallback';

const ItemThumbnail = ({ previewImage, itemLength }: ItemThumabnailProps) => {
	if (!previewImage) return null;

	return (
		<>
			<View style={styles.container}>
				<ImageWithFallback uri={previewImage} style={styles.thumbnail} />
				{/* {!!itemLength && (
					<View style={styles.badgeContainer}>
						<Text style={styles.badgeText}>{itemLength}</Text>
					</View>
				)} */}
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
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.regular,
	},
	emptyThumbnail: {
		backgroundColor: Colors.border_gray,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
