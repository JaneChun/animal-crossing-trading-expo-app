import { createComment } from '@/firebase/services/commentService';
import { CreateCommentRequest } from '@/types/comment';
import { Collection } from '@/types/post';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateComment = ({
	collectionName,
	postId,
}: {
	collectionName: Collection;
	postId: string;
}) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			requestData,
			userId,
		}: {
			requestData: CreateCommentRequest;
			userId: string;
		}) => createComment({ collectionName, postId, requestData, userId }),
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
