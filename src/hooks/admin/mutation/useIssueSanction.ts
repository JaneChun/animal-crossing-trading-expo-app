import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '@/components/ui/Toast';
import { SANCTION_KINDS } from '@/constants/sanction';
import { issueSanction } from '@/firebase/services/adminService';
import { publicUserInfoQueryKey } from '@/firebase/services/cachedUserService';
import { IssueSanctionRequest, SanctionKind } from '@/types/sanction';

import { adminUserInfoQueryKey } from '../query/useAdminUserInfo';
import { userSanctionsQueryKey } from '../query/useUserSanctions';

const getSuccessMessage = (kind: SanctionKind) => {
	if (kind === 'warning') return '경고 처리했습니다.';
	const kindLabel = SANCTION_KINDS.find(({ EN }) => EN === kind)?.KR ?? '';
	return `${kindLabel}했습니다.`;
};

export const useIssueSanction = (userId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: Omit<IssueSanctionRequest, 'userId'>) =>
			issueSanction({ ...request, userId }),
		onSuccess: (_, { kind }) => {
			queryClient.invalidateQueries({ queryKey: userSanctionsQueryKey(userId) });
			queryClient.invalidateQueries({ queryKey: ['adminSanctionRecommendation', userId] });
			queryClient.invalidateQueries({ queryKey: adminUserInfoQueryKey(userId) });
			queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
			queryClient.invalidateQueries({ queryKey: ['adminNeedsReviewUsers'] });
			queryClient.invalidateQueries({ queryKey: publicUserInfoQueryKey(userId) });
			// 위반 대상 숨김과 정지 시 전체 글 숨김이 반영되도록 그 유저 글이 보이는 캐시를 모두 새로 불러온다
			queryClient.invalidateQueries({ queryKey: ['adminReportTarget'] });
			queryClient.invalidateQueries({ queryKey: ['posts'] });
			queryClient.invalidateQueries({ queryKey: ['postDetail'] });
			queryClient.invalidateQueries({ queryKey: ['comments'] });
			queryClient.invalidateQueries({ queryKey: ['replies'] });
			showToast('success', getSuccessMessage(kind));
		},
		onError: () => showToast('error', '처리하지 못했습니다. 다시 시도해 주세요.'),
	});
};
