import FastImage from 'react-native-fast-image';

import islandImage from '@assets/images/island.png';

const Island = ({ style }: { style: any }) => {
	return (
		<FastImage source={islandImage} style={style} resizeMode={FastImage.resizeMode.contain} />
	);
};

export default Island;
