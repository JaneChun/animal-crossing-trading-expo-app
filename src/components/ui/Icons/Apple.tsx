import FastImage from 'react-native-fast-image';

import appleImage from '@assets/images/apple.webp';

const Apple = ({ style }: { style: any }) => {
	return <FastImage source={appleImage} style={style} />;
};

export default Apple;
