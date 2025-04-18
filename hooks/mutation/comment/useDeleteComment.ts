import { deleteComment } from '@/firebase/services/commentService';
import { Collection } from '@/types/post';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeleteComment = (
	collectionName: Collection,
	postId: string,
	commentId: string,
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => deleteComment(collectionName, postId, commentId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['posts', collectionName],
			});
			queryClient.invalidateQueries({
				queryKey: ['postDetail', collectionName, postId],
			});
			queryClient.invalidateQueries({
				queryKey: ['comments', collectionName, postId],
			});
		},
	});
};
