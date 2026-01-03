import { deletePost } from '@/firebase/services/postService';
import { Collection } from '@/types/post';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeletePost = <C extends Collection>(
	collectionName: C,
	postId: string,
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => deletePost(collectionName, postId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['posts', collectionName] });
		},
	});
};
