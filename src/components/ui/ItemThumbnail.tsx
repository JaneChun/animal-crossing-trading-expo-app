import { StyleSheet, View } from 'react-native';

import { FontSizes, FontWeights } from '@/constants/Typography';
import { Colors } from '@/theme/Color';
import { ItemThumabnailProps } from '@/types/components';

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
		borderColor: Colors.border.default,
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
		backgroundColor: Colors.border.default,
		borderColor: Colors.brand.primary,
	},
	badgeText: {
		color: Colors.text.tertiary,
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.regular,
	},
	emptyThumbnail: {
		backgroundColor: Colors.border.default,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
