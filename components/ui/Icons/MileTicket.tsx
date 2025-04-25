import React from 'react';
import FastImage from 'react-native-fast-image';

const MileTicket = ({ style }: { style: any }) => {
	return (
		<FastImage
			source={require('../../../assets/images/mile_ticket.png')}
			style={style}
		/>
	);
};

export default MileTicket;
