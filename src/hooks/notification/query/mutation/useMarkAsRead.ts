import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markNotificationAsRead } from '@/firebase/services/notificationService';

export const useMarkAsRead = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
	});
};
