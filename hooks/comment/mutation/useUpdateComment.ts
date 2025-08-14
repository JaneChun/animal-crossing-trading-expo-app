import { updateComment } from '@/firebase/services/commentService';
import { UpdateCommentRequest } from '@/types/comment';
import { Collection } from '@/types/post';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateComment = ({
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
			requestData,
		}: {
			commentId: string;
			requestData: UpdateCommentRequest;
		}) => updateComment({ collectionName, postId, commentId, requestData }),
		onSuccess: () => {
			// 댓글 목록 갱신
			queryClient.invalidateQueries({
				queryKey: ['comments', collectionName, postId],
			});
		},
	});
};
