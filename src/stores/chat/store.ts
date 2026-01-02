import { getSafeUid } from '@/firebase/services/chatService';
import { ChatWithReceiverInfo } from '@/types/chat';
import { create } from 'zustand';
import { ChatStore } from './types';

export const useChatStore = create<ChatStore>((set, get) => ({
	chats: [],
	setChats: (chats) => set({ chats }),
	unreadCount: 0,
	setUnreadCount: (unreadCount) => set({ unreadCount }),
	isLoading: false,
	setIsLoading: (isLoading) => set({ isLoading }),

	// Actions
	updateUnreadCount: (uid: string) => {
		const { chats } = get();
		const totalUnread = chats.reduce(
			(acc: number, chat: ChatWithReceiverInfo) => {
				const count = chat.unreadCount?.[getSafeUid(uid)] || 0;
				return acc + Number(count);
			},
			0,
		);
		set({ unreadCount: totalUnread });
	},

	clearChats: () => {
		set({ chats: [], unreadCount: 0 });
	},

	resetStore: () => {
		set({
			chats: [],
			unreadCount: 0,
			isLoading: false,
		});
	},
}));
