import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPost } from '@/firebase/services/postService';
import { Collection, CreatePostRequest, MarketType } from '@/types/post';
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
			const requestData = variables.requestData as Record<string, unknown>;
			if (collectionName === 'Boards') {
				logPostCreate({
					post_type: 'Boards',
					trade_type: requestData.type as MarketType,
					item_count: (requestData.cart as unknown[])?.length ?? 0,
				});
			} else {
				logPostCreate({
					post_type: 'Communities',
					has_image: ((requestData.images as unknown[])?.length ?? 0) > 0,
				});
			}
			queryClient.invalidateQueries({ queryKey: ['posts', collectionName] });
		},
	});
};
