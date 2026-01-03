import { Timestamp } from 'firebase/firestore';
import { Collection, Post } from './post';
import { PublicUserInfo } from './user';

type ActionType = 'reply' | 'comment';

export interface Notification {
	id: string;
	type: Collection;
	actionType?: ActionType;
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
