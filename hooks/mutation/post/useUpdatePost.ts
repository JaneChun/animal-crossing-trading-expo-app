import { updatePost } from '@/firebase/services/postService';
import { Collection, UpdatePostRequest } from '@/types/post';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdatePost = <C extends Collection>(
	collectionName: C,
	postId: string,
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (requestData: UpdatePostRequest<C>) =>
			updatePost({ collectionName, postId, requestData }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['posts', collectionName] });
			queryClient.invalidateQueries({
				queryKey: ['postDetail', collectionName, postId],
			});
		},
	});
};
