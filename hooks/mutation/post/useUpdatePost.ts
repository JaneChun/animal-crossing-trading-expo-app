import { updatePost } from '@/firebase/services/postService';
import { Collection } from '@/types/components';
import { UpdatePostRequest } from '@/types/post';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdatePost = (collectionName: Collection, postId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (requestData: UpdatePostRequest) =>
			updatePost(collectionName, postId, requestData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['posts', collectionName] });
			queryClient.invalidateQueries({
				queryKey: ['postDetail', collectionName, postId],
			});
		},
	});
};
