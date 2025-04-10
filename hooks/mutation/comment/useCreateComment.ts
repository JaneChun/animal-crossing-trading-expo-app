import { addComment } from '@/firebase/services/commentService';
import { AddCommentRequest } from '@/types/comment';
import { Collection } from '@/types/components';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateComment = (
	collectionName: Collection,
	postId: string,
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (requestData: AddCommentRequest) =>
			addComment(collectionName, postId, requestData),
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
