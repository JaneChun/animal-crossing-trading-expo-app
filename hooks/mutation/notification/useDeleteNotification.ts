import { deleteNotification } from '@/firebase/services/notificationService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeleteNotification = (notificationId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => deleteNotification(notificationId),
	});
};
