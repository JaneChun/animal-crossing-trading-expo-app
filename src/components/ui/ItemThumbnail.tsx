import { StyleSheet, View } from 'react-native';

import { FontSizes, FontWeights , BorderRadius, Theme, useThemedStyles } from '@/theme';
import { ItemThumabnailProps } from '@/types/components';

import ImageWithFallback from './ImageWithFallback';

const ItemThumbnail = ({ previewImage, itemLength }: ItemThumabnailProps) => {
	const styles = useThemedStyles(makeStyles);

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

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {},
		thumbnail: {
			width: 42,
			height: 42,
			borderRadius: BorderRadius.full,
			resizeMode: 'cover',
			borderWidth: 1,
			borderColor: colors.border.default,
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
			backgroundColor: colors.border.default,
			borderColor: colors.brand.primary,
		},
		badgeText: {
			color: colors.text.tertiary,
			fontSize: FontSizes.sm,
			fontWeight: FontWeights.regular,
		},
		emptyThumbnail: {
			backgroundColor: colors.border.default,
			justifyContent: 'center',
			alignItems: 'center',
		},
	});
