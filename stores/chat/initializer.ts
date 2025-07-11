import { db } from '@/fbase';
import { fetchAndPopulateReceiverInfo } from '@/firebase/services/chatService';
import { useUserInfo } from '@/stores/auth';
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
import { useChatStore } from './store';

export const useChatSubscriptionInitializer = () => {
	const userInfo = useUserInfo();
	const {
		setChats,
		setUnreadCount,
		setIsLoading,
		updateUnreadCount,
		clearChats,
	} = useChatStore();

	// 채팅방 목록 실시간 구독
	useEffect(() => {
		if (!userInfo) {
			clearChats();
			return;
		}

		const q: Query = query(
			collection(db, 'Chats'),
			where('visibleTo', 'array-contains', userInfo.uid),
			orderBy('updatedAt', 'desc'),
		);

		const unsubscribe = onSnapshot(
			q,
			async () => {
				setIsLoading(true);

				try {
					const { data } = await fetchAndPopulateReceiverInfo<
						Chat,
						ChatWithReceiverInfo
					>(q, userInfo.uid);

					setChats(data);
					updateUnreadCount(userInfo.uid);
				} catch (error) {
					console.warn('⚠️ ChatStore 데이터 fetch 에러:', error);
				} finally {
					setIsLoading(false);
				}
			},
			(error) => {
				console.warn('⚠️ ChatStore 구독 에러:', error);
				setIsLoading(false);
			},
		);

		return () => unsubscribe();
	}, [
		userInfo,
		setChats,
		setUnreadCount,
		setIsLoading,
		updateUnreadCount,
		clearChats,
	]);
};
