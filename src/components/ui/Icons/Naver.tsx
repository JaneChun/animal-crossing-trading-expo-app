import FastImage from 'react-native-fast-image';

import naverRoundImage from '@assets/images/naver_round.png';

const Naver = ({ style }: { style: any }) => {
	return <FastImage source={naverRoundImage} style={style} />;
};

export default Naver;
