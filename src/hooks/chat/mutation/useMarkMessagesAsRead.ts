import { markMessagesAsRead } from '@/firebase/services/chatService';
import { MarkMessageAsReadParams } from '@/types/chat';
import { useMutation } from '@tanstack/react-query';

export const useMarkMessagesAsRead = () => {
	return useMutation({
		mutationFn: ({ chatId, userId }: MarkMessageAsReadParams) =>
			markMessagesAsRead({ chatId, userId }),
	});
};
