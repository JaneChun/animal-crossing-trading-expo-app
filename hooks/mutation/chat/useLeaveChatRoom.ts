import { showToast } from '@/components/ui/Toast';
import { leaveChatRoom } from '@/firebase/services/chatService';
import { useMutation } from '@tanstack/react-query';

export const useLeaveChatRoom = ({ chatId }: { chatId: string }) => {
	return useMutation({
		mutationFn: ({ userId }: { userId: string }) =>
			leaveChatRoom({ chatId, userId }),
		onError: () => {
			showToast('error', '채팅방 삭제 중 오류가 발생했습니다.');
		},
	});
};
