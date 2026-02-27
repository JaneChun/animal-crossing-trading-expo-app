import { Timestamp } from 'firebase/firestore';

import { Message, SendChatMessageParams } from '@/types/chat';

export const convertSendParamsToMessage = ({
	sendParams,
	chatId,
}: {
	sendParams: SendChatMessageParams;
	chatId: string;
}): Message => {
	const { senderId, receiverId, message: body } = sendParams;

	const message: Message = {
		id: `system-${chatId}`,
		senderId,
		receiverId,
		body,
		createdAt: Timestamp.now(),
		isReadBy: ['system'],
	};

	return message;
};
