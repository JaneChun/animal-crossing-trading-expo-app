import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '@/components/ui/Toast';
import { setPostHidden } from '@/firebase/services/adminService';
import { Collection } from '@/types/post';

import { adminReportTargetQueryKey } from '../query/useAdminReport';

export const useSetPostHidden = ({
	reportId,
	collectionName,
	postId,
}: {
	reportId: string;
	collectionName: Collection;
	postId: string;
}) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (hidden: boolean) => setPostHidden({ collectionName, postId, hidden }),
		onSuccess: (_, hidden) => {
			queryClient.invalidateQueries({ queryKey: adminReportTargetQueryKey(reportId) });
			queryClient.invalidateQueries({ queryKey: ['posts', collectionName] });
			queryClient.invalidateQueries({ queryKey: ['postDetail', collectionName, postId] });
			showToast('success', hidden ? '게시글을 숨겼습니다.' : '게시글 숨김을 해제했습니다.');
		},
		onError: () => showToast('error', '게시글 숨김 상태를 바꾸지 못했습니다.'),
	});
};
