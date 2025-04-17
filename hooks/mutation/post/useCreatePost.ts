import { createPost } from '@/firebase/services/postService';
import { Collection, CreatePostRequest } from '@/types/post';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreatePost = <C extends Collection>(collectionName: C) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			requestData,
			userId,
		}: {
			requestData: CreatePostRequest<C>;
			userId: string;
		}) => createPost({ collectionName, requestData, userId }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['posts', collectionName] });
		},
	});
};
