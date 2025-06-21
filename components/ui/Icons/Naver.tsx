import React from 'react';
import FastImage from 'react-native-fast-image';

const Naver = ({ style }: { style: any }) => {
	return (
		<FastImage
			source={require('../../../assets/images/naver_round.png')}
			style={style}
		/>
	);
};

export default Naver;
