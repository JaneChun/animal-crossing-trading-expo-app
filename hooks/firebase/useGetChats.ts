import { db } from '@/fbase';
import { fetchAndPopulateReceiverInfo } from '@/firebase/services/chatService';
import { useAuthStore } from '@/stores/AuthStore';
import { useChatCountStore } from '@/stores/ChatCountStore';
import { Chat, ChatWithReceiverInfo } from '@/types/chat';
import {
	collection,
	onSnapshot,
	orderBy,
	query,
	where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

const useGetChats = () => {
	const userInfo = useAuthStore((state) => state.userInfo);
	const [chats, setChats] = useState<ChatWithReceiverInfo[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const setUnreadCount = useChatCountStore((state) => state.setCount);

	// 채팅방 목록 실시간 구독
	useEffect(() => {
		if (!userInfo) {
			setChats([]);
			setIsLoading(false);
			setUnreadCount(0);
			return;
		}

		const q = query(
			collection(db, 'Chats'),
			where('participants', 'array-contains', userInfo.uid), // 내가 포함된 채팅방
			orderBy('updatedAt', 'desc'), // 최신 메시지가 있는 채팅방부터 정렬
		);

		const unsubscribe = onSnapshot(q, async () => {
			setIsLoading(true);

			const { data } = await fetchAndPopulateReceiverInfo<
				Chat,
				ChatWithReceiverInfo
			>(q, userInfo.uid);
			setChats(data);

			// 안읽은 알림 수 계산 & 전역 상태에 저장
			const totalUnread = data.reduce(
				(acc: number, chat: ChatWithReceiverInfo) => {
					const count = chat.unreadCount?.[userInfo.uid] || 0;
					return acc + Number(count);
				},
				0,
			);
			setUnreadCount(totalUnread);

			setIsLoading(false);
		});

		return () => unsubscribe();
	}, [userInfo]);

	return { chats, isLoading };
};

export default useGetChats;
