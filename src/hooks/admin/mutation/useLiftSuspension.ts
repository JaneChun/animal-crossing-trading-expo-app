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
			// 정지 해제 함수가 정지 때 숨긴 게시글도 복구하므로, 그 유저 글이 보이는 캐시를 모두 새로 불러온다
			queryClient.invalidateQueries({ queryKey: ['adminReportTarget'] });
			queryClient.invalidateQueries({ queryKey: ['posts'] });
			queryClient.invalidateQueries({ queryKey: ['postDetail'] });
			showToast('success', '정지를 해제했습니다.');
		},
		onError: () => showToast('error', '정지를 해제하지 못했습니다.'),
	});
};
