import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '@/components/ui/Toast';
import { cancelSanction } from '@/firebase/services/adminService';

import { adminUserInfoQueryKey } from '../query/useAdminUserInfo';
import { reportWarningQueryKey } from '../query/useReportWarning';
import { userSanctionsQueryKey } from '../query/useUserSanctions';

// 신고 상세 [숨김 해제]: 이 신고로 건 경고를 취소하고 숨긴 대상을 다시 공개한다
export const useCancelSanction = ({ reportId, userId }: { reportId: string; userId: string }) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: cancelSanction,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: reportWarningQueryKey(reportId) });
			queryClient.invalidateQueries({ queryKey: userSanctionsQueryKey(userId) });
			queryClient.invalidateQueries({ queryKey: adminUserInfoQueryKey(userId) });
			queryClient.invalidateQueries({ queryKey: ['adminSanction'] });
			queryClient.invalidateQueries({ queryKey: ['adminNeedsReviewUsers'] });
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
