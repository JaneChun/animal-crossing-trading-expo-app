import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteNotification } from '@/firebase/services/notificationService';

export const useDeleteNotification = (notificationId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => deleteNotification(notificationId),
	});
};
