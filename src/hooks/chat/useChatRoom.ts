import { useUserInfo } from '@/stores/auth';
import { Message } from '@/types/chat';
import { formatIMessages } from '@/utilities/formatIMessages';
import { useCallback, useEffect } from 'react';
import { useRealtimeMessages } from './firebase/useRealtimeMessages';
import { useLoadMoreMessages } from './firebase/useLoadMoreMessages';
import { useLeaveChatRoom } from './mutation/useLeaveChatRoom';
import { useMarkMessagesAsRead } from './mutation/useMarkMessagesAsRead';
import { useSendMessage } from './mutation/useSendMessage';
import { useReceiverInfo } from './query/useReceiverInfo';

const REALTIME_MESSAGE_LIMIT = 20;
const LOAD_MORE_PAGE_SIZE = 50;

export const useChatRoom = ({
	chatId,
	localMessages = [],
}: {
	chatId: string;
	localMessages?: Message[];
}) => {
	const userInfo = useUserInfo();

	const {
		messages: realtimeMessages,
		isLoading: isMessagesFetching,
		oldestTimestampRef,
	} = useRealtimeMessages(chatId, REALTIME_MESSAGE_LIMIT);
	const { moreMessages, isLoadingMore, hasMore, loadMoreMessages } = useLoadMoreMessages(
		chatId,
		LOAD_MORE_PAGE_SIZE,
	);
	const { data: receiverInfo, isLoading: isReceiverInfoFetching } = useReceiverInfo(chatId);

	const { mutate: sendMessage } = useSendMessage();
	const { mutate: leaveChatRoom } = useLeaveChatRoom({ chatId });
	const { mutate: markMessagesAsRead } = useMarkMessagesAsRead();

	// 유저가 채팅방에 들어올 때, 입장한 이후에도 새 메시지가 올 때 markMessagesAsRead 실행
	useEffect(() => {
		if (chatId && userInfo) {
			markMessagesAsRead({ chatId, userId: userInfo.uid });
		}
	}, [chatId, userInfo, realtimeMessages]);

	// 이전 메시지 로드 핸들러
	const onLoadMore = useCallback(() => {
		const cursor =
			moreMessages.length > 0 ? moreMessages[0].createdAt : oldestTimestampRef.current;

		if (cursor) {
			loadMoreMessages(cursor);
		}
	}, [moreMessages, oldestTimestampRef, loadMoreMessages]);

	// moreMessages(asc) + realtimeMessages(asc) + localMessages(asc) → formatIMessages에서 reverse()
	const formattedMessages = formatIMessages(
		[...moreMessages, ...realtimeMessages, ...localMessages],
		receiverInfo?.uid,
	);

	return {
		userInfo,
		receiverInfo,
		isLoading: isMessagesFetching || isReceiverInfoFetching,
		messages: formattedMessages,
		sendMessage,
		leaveChatRoom,
		canLoadMore: realtimeMessages.length >= REALTIME_MESSAGE_LIMIT && hasMore,
		isLoadingMore,
		onLoadMore,
	};
};
