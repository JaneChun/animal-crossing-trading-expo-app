import { Timestamp } from 'firebase/firestore';
import { Collection, Post } from './post';
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

export interface PopulatedNotification extends Notification {
	postInfo: Post<Collection>;
	senderInfo: PublicUserInfo;
}

export interface NotificationWithReceiverInfo extends Notification {
	receiverInfo: PublicUserInfo;
}
