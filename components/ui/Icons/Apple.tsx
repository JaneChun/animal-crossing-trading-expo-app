import React from 'react';
import FastImage from 'react-native-fast-image';

const Apple = ({ style }: { style: any }) => {
	return (
		<FastImage
			source={require('../../../assets/images/apple.webp')}
			style={style}
		/>
	);
};

export default Apple;
