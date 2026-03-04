import { StyleProp } from 'react-native';
import FastImage, { ImageStyle } from 'react-native-fast-image';

import bellImage from '@assets/images/bell.webp';

const Bell = ({ style }: { style: StyleProp<ImageStyle> }) => {
	return <FastImage source={bellImage} style={style} />;
};

export default Bell;
