import { useMutation } from '@tanstack/react-query';

import {
	markAllUnreadMessagesAsRead,
	markMessagesAsReadByIds,
} from '@/firebase/services/chatService';
import { MarkMessageAsReadParams } from '@/types/chat';

export const useMarkAllUnreadAsRead = () => {
	return useMutation({
		mutationFn: ({ chatId, userId }: { chatId: string; userId: string }) =>
			markAllUnreadMessagesAsRead({ chatId, userId }),
	});
};

export const useMarkMessagesAsReadByIds = () => {
	return useMutation({
		mutationFn: ({ chatId, userId, unreadMessageIds }: MarkMessageAsReadParams) =>
			markMessagesAsReadByIds({ chatId, userId, unreadMessageIds }),
	});
};
