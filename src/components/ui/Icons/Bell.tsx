import FastImage from 'react-native-fast-image';

import bellImage from '@assets/images/bell.webp';

const Bell = ({ style }: { style: any }) => {
	return <FastImage source={bellImage} style={style} />;
};

export default Bell;
