import { useAuthContext } from '@/contexts/AuthContext';
import { db } from '@/fbase';
import { fetchMyChats } from '@/firebase/services/chatService';
import { Chat, ChatWithReceiverInfo } from '@/types/chat';
import { collection, orderBy, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

const useGetChats = () => {
	const { userInfo } = useAuthContext();
	const [chats, setChats] = useState<ChatWithReceiverInfo[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const fetchData = async (uid: string) => {
		setIsLoading(true);

		const q = query(
			collection(db, 'Chats'),
			where('participants', 'array-contains', uid), // 내가 포함된 채팅방
			orderBy('updatedAt', 'desc'), // 최신 메시지가 있는 채팅방부터 정렬
		);

		const { data } = await fetchMyChats<Chat, ChatWithReceiverInfo>(q, uid);

		setChats(data);
		setIsLoading(false);
	};

	const refresh = useCallback(() => {
		fetchData(userInfo!.uid);
	}, [fetchData]);

	// 초기 로드
	useEffect(() => {
		if (!userInfo) return;
		refresh();
	}, [userInfo]);

	return { chats, isLoading, refresh };
};

export default useGetChats;
