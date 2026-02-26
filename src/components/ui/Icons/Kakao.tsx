import FastImage from 'react-native-fast-image';

import kakaoRoundImage from '@assets/images/kakao_round.png';

const Kakao = ({ style }: { style: any }) => {
	return <FastImage source={kakaoRoundImage} style={style} />;
};

export default Kakao;
