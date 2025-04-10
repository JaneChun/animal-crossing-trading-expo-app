import { deletePost } from '@/firebase/services/postService';
import { Collection } from '@/types/components';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeletePost = (collectionName: Collection, postId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => deletePost(collectionName, postId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['posts', collectionName] });
		},
	});
};
