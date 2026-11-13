import { StyleSheet } from 'react-native';

import { Theme, useThemedStyles } from '@/theme';
import { ThumabnailProps } from '@/types/components';

import ImageWithFallback from './ImageWithFallback';

const Thumbnail = ({ previewImage }: ThumabnailProps) => {
	const styles = useThemedStyles(makeStyles);

	if (!previewImage) return null;

	return <ImageWithFallback uri={previewImage} style={styles.thumbnail} />;
};

export default Thumbnail;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		thumbnail: {
			width: 50,
			height: 50,
			borderRadius: 6,
			resizeMode: 'cover',
			borderWidth: 1,
			borderColor: colors.border.default,
		},
		emptyThumbnail: {
			backgroundColor: colors.border.default,
			justifyContent: 'center',
			alignItems: 'center',
		},
	});
