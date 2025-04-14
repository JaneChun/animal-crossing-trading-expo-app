import { markNotificationAsRead } from '@/firebase/services/notificationService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useMarkAsRead = (notificationId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => markNotificationAsRead(notificationId),
	});
};
