import { StyleProp } from 'react-native';
import FastImage, { ImageStyle } from 'react-native-fast-image';

import appleImage from '@assets/images/apple.webp';

const Apple = ({ style }: { style: StyleProp<ImageStyle> }) => {
	return <FastImage source={appleImage} style={style} />;
};

export default Apple;
