import React from 'react';
import FastImage from 'react-native-fast-image';

const Island = ({ style }: { style: any }) => {
	return (
		<FastImage
			source={require('../../../assets/images/island_icon.png')}
			style={style}
		/>
	);
};

export default Island;
