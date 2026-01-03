import { ChatWithReceiverInfo } from '@/types/chat';

export interface ChatStoreState {
	chats: ChatWithReceiverInfo[];
	setChats: (c: ChatWithReceiverInfo[]) => void;
	unreadCount: number;
	setUnreadCount: (n: number) => void;
	isLoading: boolean;
	setIsLoading: (b: boolean) => void;
}

export interface ChatActions {
	updateUnreadCount: (uid: string) => void;
	clearChats: () => void;
	resetStore: () => void;
}

export interface ChatStore extends ChatStoreState, ChatActions {}