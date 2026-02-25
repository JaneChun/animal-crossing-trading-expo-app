import React from 'react';
import FastImage from 'react-native-fast-image';

const Island = ({ style }: { style: any }) => {
	return (
		<FastImage
			source={require('../../../../assets/images/island.png')}
			style={style}
			resizeMode={FastImage.resizeMode.contain}
		/>
	);
};

export default Island;
