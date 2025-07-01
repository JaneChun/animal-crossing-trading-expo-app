import { db } from '@/fbase';
import { fetchAndPopulateReceiverInfo } from '@/firebase/services/chatService';
import { useAuthStore } from '@/stores/AuthStore';
import { Chat, ChatWithReceiverInfo } from '@/types/chat';
import {
	collection,
	onSnapshot,
	orderBy,
	Query,
	query,
	where,
} from 'firebase/firestore';
import { useEffect } from 'react';
import { create } from 'zustand';

interface ChatStoreState {
	chats: ChatWithReceiverInfo[];
	setChats: (c: ChatWithReceiverInfo[]) => void;
	unreadCount: number;
	setUnreadCount: (n: number) => void;
	isLoading: boolean;
	setIsLoading: (b: boolean) => void;
}

export const useChatStore = create<ChatStoreState>((set) => ({
	chats: [],
	setChats: (c) => set({ chats: c }),
	unreadCount: 0,
	setUnreadCount: (n) => set({ unreadCount: n }),
	isLoading: false,
	setIsLoading: (b) => set({ isLoading: b }),
}));

export const useChatSubscriptionInitializer = () => {
	const userInfo = useAuthStore((state) => state.userInfo);
	const setChats = useChatStore((state) => state.setChats);
	const setUnreadCount = useChatStore((state) => state.setUnreadCount);
	const setIsLoading = useChatStore((state) => state.setIsLoading);

	// 채팅방 목록 실시간 구독
	useEffect(() => {
		if (!userInfo) {
			setChats([]);
			setUnreadCount(0);
			return;
		}

		const q: Query = query(
			collection(db, 'Chats'),
			// where('participants', 'array-contains', userInfo.uid), // 내가 포함된 채팅방
			where('visibleTo', 'array-contains', userInfo.uid), // 내가 나가지 않은 채팅방
			orderBy('updatedAt', 'desc'), // 최신 메시지가 있는 채팅방부터 정렬
		);

		const unsubscribe = onSnapshot(
			q,
			async () => {
				setIsLoading(true);

				const { data } = await fetchAndPopulateReceiverInfo<
					Chat,
					ChatWithReceiverInfo
				>(q, userInfo.uid);
				setChats(data);

				// 안읽은 알림 수 계산 & 전역 상태에 저장
				const totalUnread = data.reduce(
					(acc: number, chat: ChatWithReceiverInfo) => {
						const count = chat.unreadCount?.[getSafeUid(userInfo.uid)] || 0;
						return acc + Number(count);
					},
					0,
				);
				setUnreadCount(totalUnread);

				setIsLoading(false);
			},
			(e) => {
				console.warn('⚠️ ChatStore 구독 에러', e);
			},
		);

		return () => unsubscribe();
	}, [userInfo?.uid]);
};

function getSafeUid(uid: string) {
	return uid.replace(/\./g, '');
}
