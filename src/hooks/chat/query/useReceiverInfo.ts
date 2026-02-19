import { db } from '@/config/firebase';
import { useCachedPublicUserInfo } from '@/hooks/shared/useCachedPublicUserInfo';
import { useUserInfo } from '@/stores/auth';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';

// 1단계: chatId로 receiverId 조회 (Chat 문서에서 participants 추출)
export const useReceiverId = (chatId: string) => {
	const userInfo = useUserInfo();

	return useQuery({
		queryKey: ['receiverId', chatId],
		queryFn: async () => {
			if (!userInfo?.uid) return null;

			// Chat 문서에서 participants 배열을 가져와서 상대방 ID 추출
			const chatDoc = await getDoc(doc(db, 'Chats', chatId));
			if (!chatDoc.exists()) return null;

			const participants = chatDoc.data().participants;
			return participants.find((id: string) => id !== userInfo.uid) || null;
		},
		enabled: !!chatId && !!userInfo?.uid,
		staleTime: 30 * 60 * 1000, // 30분간 캐시
	});
};

// 2단계: receiverId로 유저 정보 조회 (publicUserInfoQueryKey로 캐시 공유)
export const useReceiverInfo = (chatId: string) => {
	const { data: receiverId, isLoading: isLoadingReceiverId } =
		useReceiverId(chatId);

	const {
		data: receiverInfo,
		isLoading: isLoadingReceiverInfo,
		...rest
	} = useCachedPublicUserInfo(receiverId);

	return {
		data: receiverInfo,
		isLoading: isLoadingReceiverId || isLoadingReceiverInfo,
		...rest,
	};
};
