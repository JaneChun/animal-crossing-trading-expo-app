import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markAllNotificationAsRead } from '@/firebase/services/notificationService';

export const useMarkAllAsRead = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (notificationIds: string[]) => markAllNotificationAsRead(notificationIds),
	});
};
