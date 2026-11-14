import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '@/components/ui/Toast';
import { liftSuspension } from '@/firebase/services/adminService';

import { adminUserInfoQueryKey } from '../query/useAdminUserInfo';

export const useLiftSuspension = (uid: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => liftSuspension(uid),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminUserInfoQueryKey(uid) });
			queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
			queryClient.invalidateQueries({ queryKey: ['adminNeedsReviewUsers'] });
			showToast('success', '정지를 해제했습니다.');
		},
		onError: () => showToast('error', '정지를 해제하지 못했습니다.'),
	});
};
