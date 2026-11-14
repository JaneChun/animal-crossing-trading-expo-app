import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '@/components/ui/Toast';
import { decideAppeal, DecideAppealRequest } from '@/firebase/services/adminService';
import { publicUserInfoQueryKey } from '@/firebase/services/cachedUserService';

import { adminSanctionQueryKey } from '../query/useAdminSanction';
import { adminUserInfoQueryKey } from '../query/useAdminUserInfo';
import { userSanctionsQueryKey } from '../query/useUserSanctions';

export const useDecideAppeal = ({ sanctionId, userId }: { sanctionId: string; userId: string }) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: Omit<DecideAppealRequest, 'sanctionId'>) =>
			decideAppeal({ ...request, sanctionId }),
		onSuccess: (_, { result }) => {
			queryClient.invalidateQueries({ queryKey: adminSanctionQueryKey(sanctionId) });
			queryClient.invalidateQueries({ queryKey: userSanctionsQueryKey(userId) });
			queryClient.invalidateQueries({ queryKey: ['adminNeedsReviewUsers'] });
			queryClient.invalidateQueries({ queryKey: ['adminSanctionRecommendation', userId] });
			if (result === 'canceled') {
				// 조치 취소는 정지 해제·글 공개를 함께 하므로 유저와 글 캐시도 새로 불러온다
				queryClient.invalidateQueries({ queryKey: adminUserInfoQueryKey(userId) });
				queryClient.invalidateQueries({ queryKey: publicUserInfoQueryKey(userId) });
				queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
				queryClient.invalidateQueries({ queryKey: ['adminReportTarget'] });
				queryClient.invalidateQueries({ queryKey: ['posts'] });
				queryClient.invalidateQueries({ queryKey: ['postDetail'] });
				queryClient.invalidateQueries({ queryKey: ['comments'] });
				queryClient.invalidateQueries({ queryKey: ['replies'] });
			}
			showToast(
				'success',
				result === 'canceled' ? '조치를 취소했습니다.' : '조치를 유지했습니다.',
			);
		},
		onError: () => showToast('error', '처리하지 못했습니다. 다시 시도해 주세요.'),
	});
};
