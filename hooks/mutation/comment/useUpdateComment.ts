import { updateComment } from '@/firebase/services/commentService';
import { UpdateCommentRequest } from '@/types/comment';
import { Collection } from '@/types/components';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateComment = (
	collectionName: Collection,
	postId: string,
	commentId: string,
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (requestData: UpdateCommentRequest) =>
			updateComment(collectionName, postId, commentId, requestData),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['postDetail', collectionName, postId],
			});
			queryClient.invalidateQueries({
				queryKey: ['comments', collectionName, postId],
			});
		},
	});
};
