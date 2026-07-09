import { StyleSheet, type StyleProp } from 'react-native';
import FastImage, { type ImageStyle as FastImageStyle } from 'react-native-fast-image';

import threeDotsImage from '@assets/images/three_dots.gif';

type ThreeDotsLoadingIndicatorProps = {
	style?: StyleProp<FastImageStyle>;
};

const ThreeDotsLoadingIndicator = ({ style }: ThreeDotsLoadingIndicatorProps) => {
	return <FastImage source={threeDotsImage} style={[styles.image, style]} />;
};

export default ThreeDotsLoadingIndicator;

const styles = StyleSheet.create({
	image: {
		aspectRatio: 3,
		width: '40%',
	},
});
