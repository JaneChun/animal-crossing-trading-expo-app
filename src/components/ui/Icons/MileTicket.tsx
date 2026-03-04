import { StyleProp } from 'react-native';
import FastImage, { ImageStyle } from 'react-native-fast-image';

import MileTicketImage from '@assets/images/mile_ticket.png';

const MileTicket = ({ style }: { style: StyleProp<ImageStyle> }) => {
	return <FastImage source={MileTicketImage} style={style} />;
};

export default MileTicket;
