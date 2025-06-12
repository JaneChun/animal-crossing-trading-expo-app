import React from 'react';
import FastImage from 'react-native-fast-image';

const Bell = ({ style }: { style: any }) => {
	return (
		<FastImage
			source={require('../../../assets/images/bell.webp')}
			style={style}
		/>
	);
};

export default Bell;
