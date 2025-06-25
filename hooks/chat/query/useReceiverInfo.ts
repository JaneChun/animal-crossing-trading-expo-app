import { getPublicUserInfo } from '@/firebase/services/userService';
import { useAuthStore } from '@/stores/AuthStore';
import { useQuery } from '@tanstack/react-query';

export const useReceiverInfo = (chatId: string) => {
	const userInfo = useAuthStore((state) => state.userInfo);

	const fetchReceiverInfo = async () => {
		const receiverId = chatId.split('_').find((id) => id !== userInfo?.uid);
		if (!receiverId) return null;

		return await getPublicUserInfo(receiverId);
	};

	return useQuery({
		queryKey: ['receiverInfo', chatId],
		queryFn: fetchReceiverInfo,
		enabled: !!chatId && !!userInfo,
	});
};
