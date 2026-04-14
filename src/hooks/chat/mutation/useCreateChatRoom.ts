import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '@/components/ui/Toast';
import { createChatRoom } from '@/firebase/services/chatService';
import { CreateChatRoomParams } from '@/types/chat';
import { logChatRoomCreate } from '@/utilities/analytics';

export const useCreateChatRoom = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ collectionName, postId, user1, user2 }: CreateChatRoomParams) => {
			const chatId = await createChatRoom({ collectionName, postId, user1, user2 });
			return chatId;
		},
		onSuccess: (_, variables) => {
			logChatRoomCreate();
			// 게시글 상세 캐시 무효화 (chatRoomIds 업데이트 반영)
			queryClient.invalidateQueries({
				queryKey: ['postDetail', variables.collectionName, variables.postId],
			});
		},
		onError: () => {
			showToast('error', '채팅방 생성 중 오류가 발생했습니다.');
		},
	});
};
