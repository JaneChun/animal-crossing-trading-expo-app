import { useAuthContext } from '@/contexts/AuthContext';
import { db } from '@/fbase';
import { getPublicUserInfo } from '@/firebase/services/userService';
import { ChatWithReceiverInfo } from '@/types/chat';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const useGetChats = () => {
	const { userInfo } = useAuthContext();
	const [chats, setChats] = useState<ChatWithReceiverInfo[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		const getChats = async () => {
			if (!userInfo) return;

			setIsLoading(true);
			await fetchUserChats(userInfo.uid);
			setIsLoading(false);
		};

		getChats();
	}, [userInfo]);

	const fetchUserChats = async (userId: string) => {
		try {
			const q = query(
				collection(db, 'Chats'),
				where('participants', 'array-contains', userId), // 내가 포함된 채팅방
				orderBy('updatedAt', 'desc'), // 최신 메시지가 있는 채팅방부터 정렬
			);

			const querySnapshot = await getDocs(q);

			const chatsList = await Promise.all(
				querySnapshot.docs.map(async (doc) => {
					const docData = doc.data();
					const receiverId = docData.participants.find(
						(uid: string) => uid !== userId,
					);
					const receiverInfo = await getPublicUserInfo(receiverId);

					return {
						id: doc.id,
						...docData,
						receiverInfo: {
							...receiverInfo,
							uid: receiverId,
						},
					} as ChatWithReceiverInfo;
				}),
			);

			setChats(chatsList);
		} catch (e: any) {
			console.log('채팅방 목록 가져오기 오류:', e);
			return [];
		}
	};

	return { chats, isLoading };
};

export default useGetChats;
