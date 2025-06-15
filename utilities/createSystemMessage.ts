import { SendChatMessageParams } from '@/types/chat';
import { Collection } from '@/types/post';

export const createSystemMessage = ({
	chatId,
	collectionName,
	postId,
}: {
	chatId: string;
	collectionName: Collection;
	postId: string;
}): SendChatMessageParams => {
	return {
		chatId,
		senderId: 'system',
		receiverId: 'system',
		message: JSON.stringify({
			collectionName,
			postId,
		}),
	};
};
