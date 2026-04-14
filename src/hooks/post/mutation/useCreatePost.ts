import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPost } from '@/firebase/services/postService';
import { Collection, CreatePostRequest } from '@/types/post';
import { logPostCreate } from '@/utilities/analytics';

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
		onSuccess: (_, variables) => {
			if (collectionName === 'Boards') {
				const requestData = variables.requestData as CreatePostRequest<'Boards'>;
				logPostCreate({
					post_type: 'Boards',
					trade_type: requestData.type,
					item_count: requestData.cart?.length ?? 0,
				});
			} else {
				const requestData = variables.requestData as CreatePostRequest<'Communities'>;
				logPostCreate({
					post_type: 'Communities',
					has_image: (requestData.images?.length ?? 0) > 0,
				});
			}
			queryClient.invalidateQueries({ queryKey: ['posts', collectionName] });
		},
	});
};
