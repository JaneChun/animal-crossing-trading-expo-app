import { showToast } from '@/components/ui/Toast';
import { createChatRoom } from '@/firebase/services/chatService';
import { CreateChatRoomParams } from '@/types/chat';
import { useMutation } from '@tanstack/react-query';

export const useCreateChatRoom = () => {
	return useMutation({
		mutationFn: ({
			collectionName,
			postId,
			user1,
			user2,
		}: CreateChatRoomParams) => {
			const chatId = createChatRoom({ collectionName, postId, user1, user2 });
			return chatId;
		},
		onError: () => {
			showToast('error', '채팅방 생성 중 오류가 발생했습니다.');
		},
	});
};
