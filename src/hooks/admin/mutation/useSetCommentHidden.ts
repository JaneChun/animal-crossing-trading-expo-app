import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '@/components/ui/Toast';
import { setCommentHidden } from '@/firebase/services/adminService';
import { Collection } from '@/types/post';

import { adminReportTargetQueryKey } from '../query/useAdminReport';

export const useSetCommentHidden = ({
	reportId,
	collectionName,
	postId,
	commentId,
}: {
	reportId: string;
	collectionName: Collection;
	postId: string;
	commentId: string;
}) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (hidden: boolean) =>
			setCommentHidden({ collectionName, postId, commentId, hidden }),
		onSuccess: (_, hidden) => {
			queryClient.invalidateQueries({ queryKey: adminReportTargetQueryKey(reportId) });
			queryClient.invalidateQueries({ queryKey: ['comments', collectionName, postId] });
			queryClient.invalidateQueries({ queryKey: ['posts', collectionName] });
			queryClient.invalidateQueries({ queryKey: ['postDetail', collectionName, postId] });
			showToast('success', hidden ? '댓글을 숨겼습니다.' : '댓글 숨김을 해제했습니다.');
		},
		onError: () => showToast('error', '댓글 숨김 상태를 바꾸지 못했습니다.'),
	});
};
