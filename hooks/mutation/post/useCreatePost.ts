import { createPost } from '@/firebase/services/postService';
import { Collection } from '@/types/components';
import { CreatePostRequest } from '@/types/post';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreatePost = (collectionName: Collection) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (requestData: CreatePostRequest) =>
			createPost(collectionName, requestData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['posts', collectionName] });
		},
	});
};
