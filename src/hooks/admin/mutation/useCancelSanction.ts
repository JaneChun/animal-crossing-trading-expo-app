import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '@/components/ui/Toast';
import { cancelSanction } from '@/firebase/services/adminService';
import { publicUserInfoQueryKey } from '@/firebase/services/cachedUserService';

import { adminUserInfoQueryKey } from '../query/useAdminUserInfo';
import { userSanctionsQueryKey } from '../query/useUserSanctions';

// 조치 상세 [조치 취소]: 이의 신청 없는 유효한 조치를 취소한다(정지 해제, 숨긴 대상 재공개, 위반 횟수 제외)
export const useCancelSanction = (userId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: cancelSanction,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userSanctionsQueryKey(userId) });
			queryClient.invalidateQueries({ queryKey: adminUserInfoQueryKey(userId) });
			queryClient.invalidateQueries({ queryKey: publicUserInfoQueryKey(userId) });
			queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
			queryClient.invalidateQueries({ queryKey: ['adminSanction'] });
			queryClient.invalidateQueries({ queryKey: ['adminStageSanctions'] });
			queryClient.invalidateQueries({ queryKey: ['adminSanctionRecommendation', userId] });
			queryClient.invalidateQueries({ queryKey: ['adminReportTarget'] });
			queryClient.invalidateQueries({ queryKey: ['posts'] });
			queryClient.invalidateQueries({ queryKey: ['postDetail'] });
			queryClient.invalidateQueries({ queryKey: ['comments'] });
			queryClient.invalidateQueries({ queryKey: ['replies'] });
			showToast('success', '조치를 취소했습니다.');
		},
		onError: () => showToast('error', '처리하지 못했습니다. 다시 시도해 주세요.'),
	});
};
