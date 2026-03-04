import { StyleProp } from 'react-native';
import FastImage, { ImageStyle } from 'react-native-fast-image';

import islandImage from '@assets/images/island.png';

const Island = ({ style }: { style: StyleProp<ImageStyle> }) => {
	return (
		<FastImage source={islandImage} style={style} resizeMode={FastImage.resizeMode.contain} />
	);
};

export default Island;
