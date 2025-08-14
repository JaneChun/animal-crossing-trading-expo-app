import { updateReply } from '@/firebase/services/replyService';
import { Collection } from '@/types/post';
import { UpdateReplyRequest } from '@/types/reply';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateReply = ({
	collectionName,
	postId,
}: {
	collectionName: Collection;
	postId: string;
}) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			commentId,
			replyId,
			requestData,
		}: {
			commentId: string;
			replyId: string;
			requestData: UpdateReplyRequest;
		}) => updateReply({ collectionName, postId, commentId, replyId, requestData }),
		onSuccess: (_, { commentId }) => {
			// 답글 목록 갱신
			queryClient.invalidateQueries({
				queryKey: ['replies', collectionName, postId, commentId],
			});
		},
	});
};
