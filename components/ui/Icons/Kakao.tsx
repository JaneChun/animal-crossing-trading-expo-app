import React from 'react';
import FastImage from 'react-native-fast-image';

const Kakao = ({ style }: { style: any }) => {
	return (
		<FastImage
			source={require('../../../assets/images/kakao_round.png')}
			style={style}
		/>
	);
};

export default Kakao;
