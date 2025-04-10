import { markAllNotificationAsRead } from '@/firebase/services/notificationService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useMarkAllAsRead = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (notificationIds: string[]) =>
			markAllNotificationAsRead(notificationIds),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notifications'] });
		},
	});
};
