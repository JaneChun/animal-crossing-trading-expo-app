import { useUserInfo } from '@/stores/auth';
import { Message } from '@/types/chat';
import { formatIMessages } from '@/utilities/formatIMessages';
import { useCallback, useEffect, useRef } from 'react';
import { useRealtimeMessages } from './firebase/useRealtimeMessages';
import { useLoadMoreMessages } from './firebase/useLoadMoreMessages';
import { useLeaveChatRoom } from './mutation/useLeaveChatRoom';
import {
	useMarkAllUnreadAsRead,
	useMarkMessagesAsReadByIds,
} from './mutation/useMarkMessagesAsRead';
import { useSendMessage } from './mutation/useSendMessage';
import { useReceiverInfo } from './query/useReceiverInfo';
import { REALTIME_MESSAGE_LIMIT, LOAD_MORE_PAGE_SIZE } from '@/constants/chat';

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
	const { mutate: markAllUnreadAsRead } = useMarkAllUnreadAsRead();
	const { mutate: markMessagesAsReadByIds } = useMarkMessagesAsReadByIds();

	// 마지막으로 초기 읽음 처리를 완료한 chatId 추적
	const lastReadChatIdRef = useRef<string | null>(null);

	// 초기 진입: getDocs로 전체 안읽은 메시지 읽음 처리
	// 이후 새 메시지: snapshot 데이터에서 안읽은 메시지 ID만 추출하여 읽음 처리
	useEffect(() => {
		if (!chatId || !userInfo || realtimeMessages.length === 0) return;

		if (lastReadChatIdRef.current !== chatId) {
			markAllUnreadAsRead({ chatId, userId: userInfo.uid });
			lastReadChatIdRef.current = chatId;
		} else {
			const unreadMessageIds = realtimeMessages
				.filter((message) => !message.isReadBy.includes(userInfo.uid))
				.map(({ id }) => id);

			if (unreadMessageIds.length === 0) return;

			markMessagesAsReadByIds({ chatId, userId: userInfo.uid, unreadMessageIds });
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
