import { StyleSheet } from 'react-native';

import { Colors } from '@/theme/Color';
import { ThumabnailProps } from '@/types/components';

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
		borderColor: Colors.border.default,
	},
	emptyThumbnail: {
		backgroundColor: Colors.border.default,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
