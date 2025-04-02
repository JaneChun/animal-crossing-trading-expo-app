import { Timestamp } from 'firebase/firestore';
import { Collection } from './components';
import { PublicUserInfo } from './user';

export interface Notification {
	id: string;
	type: Collection;
	body: string;
	postId: string;
	receiverId: string;
	senderId: string;
	createdAt: Timestamp;
	isRead: boolean;
}

export interface NotificationWithReceiverInfo extends Notification {
	receiverInfo: PublicUserInfo;
}
