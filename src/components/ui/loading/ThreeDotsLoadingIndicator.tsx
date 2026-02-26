import { StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';

import threeDotsImage from '@assets/images/three_dots.gif';

const ThreeDotsLoadingIndicator = () => {
	return <FastImage source={threeDotsImage} style={styles.image} />;
};

export default ThreeDotsLoadingIndicator;

const styles = StyleSheet.create({
	image: {
		aspectRatio: 3,
		width: '40%',
	},
});
