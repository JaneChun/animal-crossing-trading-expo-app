import { db } from '@/config/firebase';
import { getPublicUserInfo } from '@/firebase/services/userService';
import { useUserInfo } from '@/stores/auth';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';

export const useReceiverInfo = (chatId: string) => {
	const userInfo = useUserInfo();

	const fetchReceiverInfo = async () => {
		if (!userInfo?.uid) return null;

		// Chat 문서에서 participants 배열을 가져와서 상대방 ID 추출
		const chatDoc = await getDoc(doc(db, 'Chats', chatId));
		if (!chatDoc.exists()) return null;

		const participants = chatDoc.data().participants;
		const receiverId = participants.find((id: string) => id !== userInfo.uid);
		if (!receiverId) return null;

		return await getPublicUserInfo(receiverId);
	};

	return useQuery({
		queryKey: ['receiverInfo', chatId],
		queryFn: fetchReceiverInfo,
		enabled: !!chatId && !!userInfo,
		staleTime: 30 * 60 * 1000, // 30분간 캐시
	});
};
