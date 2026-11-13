import { StyleProp } from 'react-native';
import FastImage, { ImageStyle } from 'react-native-fast-image';

import googleImage from '@assets/images/google.png';

const Google = ({ style }: { style: StyleProp<ImageStyle> }) => {
	return <FastImage source={googleImage} style={style} />;
};

export default Google;
