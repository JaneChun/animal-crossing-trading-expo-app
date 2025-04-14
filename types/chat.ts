import { Timestamp } from 'firebase/firestore';
import { Collection } from './components';
import { PublicUserInfo } from './user';

export interface Chat {
	id: string;
	participants: string[];
	lastMessage: string;
	lastMessageSenderId: string;
	unreadCount: { [id: string]: number };
	updatedAt: Timestamp;
}

export interface ChatWithReceiverInfo extends Chat {
	receiverInfo: PublicUserInfo;
}

// firebase/services/chatService.ts
export interface CreateChatRoomParams {
	collectionName: Collection;
	postId: string;
	user1: string;
	user2: string;
}

export interface LeaveChatRoomParams {
	chatId: string;
	userId: string;
}

export interface MarkMessageAsReadParams {
	chatId: string;
	userId: string;
}

export interface SendChatMessageParams {
	chatId: string;
	senderId: string;
	receiverId: string;
	message: string;
}
