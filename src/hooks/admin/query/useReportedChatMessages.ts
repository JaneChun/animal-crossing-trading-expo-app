import { useQuery } from '@tanstack/react-query';

import { fetchReportedChatMessages } from '@/firebase/services/adminService';

export const useReportedChatMessages = (chatId: string) => {
	return useQuery({
		queryKey: ['adminChatMessages', chatId],
		queryFn: () => fetchReportedChatMessages(chatId),
		enabled: !!chatId,
	});
};
