import { useAuthStore } from '@/stores/AuthStore';
import { formatIMessages } from '@/utilities/formatIMessages';
import { useEffect } from 'react';
import { useGetChatMessages } from '../firebase/useGetChatMessages';
import { useLeaveChatRoom } from '../mutation/chat/useLeaveChatRoom';
import { useMarkMessagesAsRead } from '../mutation/chat/useMarkMessagesAsRead';
import { useSendMessage } from '../mutation/chat/useSendMessage';
import { useReceiverInfo } from '../query/chat/useReceiverInfo';

export const useChatRoom = (chatId: string) => {
	const userInfo = useAuthStore((state) => state.userInfo);

	const { messages, isLoading: isMessagesFetching } =
		useGetChatMessages(chatId);
	const { data: receiverInfo, isLoading: isReceiverInfoFetching } =
		useReceiverInfo(chatId);

	const { mutate: sendMessage } = useSendMessage();
	const { mutate: leaveChatRoom } = useLeaveChatRoom({ chatId });
	const { mutate: markMessagesAsRead } = useMarkMessagesAsRead();

	// 유저가 채팅방에 들어올 때, 입장한 이후에도 새 메시지가 올 때 markMessagesAsRead 실행
	useEffect(() => {
		const readMessages = async () => {
			if (chatId && userInfo) {
				markMessagesAsRead({ chatId, userId: userInfo.uid });
			}
		};

		readMessages();
	}, [chatId, userInfo, messages]);

	const formattedMessages = formatIMessages(messages, receiverInfo?.uid);

	return {
		userInfo,
		receiverInfo,
		isLoading: isMessagesFetching || isReceiverInfoFetching,
		messages: formattedMessages,
		sendMessage,
		leaveChatRoom,
	};
};
