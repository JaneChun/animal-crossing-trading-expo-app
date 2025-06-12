import { markNotificationAsRead } from '@/firebase/services/notificationService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useMarkAsRead = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (notificationId: string) =>
			markNotificationAsRead(notificationId),
	});
};
