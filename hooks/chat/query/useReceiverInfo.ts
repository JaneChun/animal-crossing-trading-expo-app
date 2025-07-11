import { getPublicUserInfo } from '@/firebase/services/userService';
import { useUserInfo } from '@/stores/auth';
import { useQuery } from '@tanstack/react-query';

export const useReceiverInfo = (chatId: string) => {
	const userInfo = useUserInfo();

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
