import { Message } from '@/types/chat'; // your own type
import { IMessage } from 'react-native-gifted-chat';

export const formatIMessages = (
	messages: Message[],
	receiverUid?: string,
): IMessage[] => {
	return messages
		.map((msg) => ({
			_id: msg.id,
			text: msg.body,
			createdAt: msg.createdAt.toDate(),
			user: { _id: msg.senderId },
			received: receiverUid ? msg.isReadBy.includes(receiverUid) : false,
		}))
		.reverse();
};
