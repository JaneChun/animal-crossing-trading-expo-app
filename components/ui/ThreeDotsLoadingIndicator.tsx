import React from 'react';
import { StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';

const ThreeDotsLoadingIndicator = () => {
	return (
		<FastImage
			source={require('../../assets/images/three_dots.gif')}
			style={styles.image}
		/>
	);
};

export default ThreeDotsLoadingIndicator;

const styles = StyleSheet.create({
	image: {
		aspectRatio: 3,
		width: '40%',
	},
});
