import { db } from '@/config/firebase';
import { populateReceiverInfo } from '@/firebase/services/chatService';
import { useUserInfo } from '@/stores/auth';
import { Chat } from '@/types/chat';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useChatStore } from './store';

export const useChatSubscriptionInitializer = () => {
	const userInfo = useUserInfo();
	const queryClient = useQueryClient();
	const { setChats, setUnreadCount, setIsLoading, updateUnreadCount, clearChats } =
		useChatStore();

	// 채팅방 목록 실시간 구독
	useEffect(() => {
		if (!userInfo) {
			clearChats();
			return;
		}

		const q = query(
			collection(db, 'Chats'),
			where('visibleTo', 'array-contains', userInfo.uid),
			orderBy('updatedAt', 'desc'),
		);

		const unsubscribe = onSnapshot(
			q,
			async (snapshot) => {
				setIsLoading(true);

				try {
					const chats: Chat[] = snapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data(),
					})) as Chat[];

					const populatedChats = await populateReceiverInfo({
						chats,
						userId: userInfo.uid,
						queryClient,
					});

					setChats(populatedChats);
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
	}, [userInfo, setChats, setUnreadCount, setIsLoading, updateUnreadCount, clearChats]);
};
