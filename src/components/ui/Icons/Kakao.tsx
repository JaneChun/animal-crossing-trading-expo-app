import { StyleProp } from 'react-native';
import FastImage, { ImageStyle } from 'react-native-fast-image';

import kakaoRoundImage from '@assets/images/kakao_round.png';

const Kakao = ({ style }: { style: StyleProp<ImageStyle> }) => {
	return <FastImage source={kakaoRoundImage} style={style} />;
};

export default Kakao;
