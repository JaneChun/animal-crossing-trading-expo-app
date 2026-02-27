import FastImage from 'react-native-fast-image';

import MileTicketImage from '@assets/images/mile_ticket.png';

const MileTicket = ({ style }: { style: any }) => {
	return <FastImage source={MileTicketImage} style={style} />;
};

export default MileTicket;
