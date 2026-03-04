import { StyleProp } from 'react-native';
import FastImage, { ImageStyle } from 'react-native-fast-image';

import naverRoundImage from '@assets/images/naver_round.png';

const Naver = ({ style }: { style: StyleProp<ImageStyle> }) => {
	return <FastImage source={naverRoundImage} style={style} />;
};

export default Naver;
