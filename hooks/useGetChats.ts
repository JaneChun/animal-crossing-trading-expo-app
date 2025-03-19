import { useAuthContext } from '@/contexts/AuthContext';
import { db } from '@/fbase';
import { fetchMyChats } from '@/firebase/services/chatService';
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
	const { userInfo } = useAuthContext();
	const [chats, setChats] = useState<ChatWithReceiverInfo[]>([]);
	const [unreadCount, setUnreadCount] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	// 채팅방 목록 실시간 구독
	useEffect(() => {
		if (!userInfo) return;

		const q = query(
			collection(db, 'Chats'),
			where('participants', 'array-contains', userInfo.uid), // 내가 포함된 채팅방
			orderBy('updatedAt', 'desc'), // 최신 메시지가 있는 채팅방부터 정렬
		);

		const unsubscribe = onSnapshot(q, async (snapshot) => {
			setIsLoading(true);

			const { data } = await fetchMyChats<Chat, ChatWithReceiverInfo>(
				q,
				userInfo.uid,
			);
			setChats(data);
			getSumOfUnreadMessage(data);

			setIsLoading(false);
		});

		return () => unsubscribe();
	}, [userInfo]);

	const getSumOfUnreadMessage = async (chats: ChatWithReceiverInfo[]) => {
		if (!userInfo) return;

		const sum = chats.reduce(
			(acc: number, { unreadCount }) =>
				acc + Number(unreadCount[userInfo.uid] || 0),
			0,
		);
		setUnreadCount(sum);
	};

	return { chats, unreadCount, isLoading };
};

export default useGetChats;
