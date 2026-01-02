import React from 'react';
import FastImage from 'react-native-fast-image';

const Leaf = ({ style }: { style: any }) => {
	return (
		<FastImage
			source={require('../../../../assets/images/leaf.png')}
			style={style}
			resizeMode={FastImage.resizeMode.contain}
		/>
	);
};

export default Leaf;
