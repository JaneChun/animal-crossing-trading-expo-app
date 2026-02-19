import { db } from '@/config/firebase';
import { queryDocs } from '@/firebase/core/firestoreService';
import { Message } from '@/types/chat';
import { Timestamp } from 'firebase/firestore';
import { collection, limit, orderBy, query, startAfter } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useLoadMoreMessages = (chatId: string, pageSize: number) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const isFetchingRef = useRef<boolean>(false);

	// chatId 변경 시 state 초기화
	useEffect(() => {
		setMessages([]);
		setHasMore(true);
		setIsLoading(false);
		isFetchingRef.current = false;
	}, [chatId]);

	const loadMoreMessages = useCallback(
		async (cursor: Timestamp) => {
			// 중복 호출 방지 (state는 비동기라 ref로 체크)
			if (isFetchingRef.current) return;
			isFetchingRef.current = true;
			setIsLoading(true);

			try {
				const q = query(
					collection(db, 'Chats', chatId, 'Messages'),
					orderBy('createdAt', 'desc'),
					startAfter(cursor),
					limit(pageSize),
				);

				const fetched = await queryDocs<Message>(q);

				if (fetched.length < pageSize) {
					setHasMore(false);
				}

				// desc로 가져온 결과를 asc로 뒤집어서 시간순 정렬
				const moreMessages = fetched.reverse();

				// 기존 earlier 메시지 앞에 새로 가져온 과거 메시지를 누적
				setMessages((prev) => [...moreMessages, ...prev]);
			} catch (error) {
				console.log('이전 메시지 로드 실패:', error);
			} finally {
				isFetchingRef.current = false;
				setIsLoading(false);
			}
		},
		[chatId, pageSize],
	);

	return {
		moreMessages: messages,
		isLoadingMore: isLoading,
		hasMore,
		loadMoreMessages,
	};
};
