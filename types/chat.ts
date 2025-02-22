import { Timestamp } from 'firebase/firestore';
import { PublicUserInfo } from './user';

export interface Chat {
	id: string;
	participants: string[];
	lastMessage: string;
	lastMessageSenderId: string;
	updatedAt: Timestamp;
}

export interface ChatWithReceiverInfo extends Chat {
	receiverInfo: PublicUserInfo;
}
