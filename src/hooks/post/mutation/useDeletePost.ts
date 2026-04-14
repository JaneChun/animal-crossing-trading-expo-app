import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePost } from '@/firebase/services/postService';
import { Collection, CommunityType, MarketType, PostWithCreatorInfo } from '@/types/post';
import { logPostDelete } from '@/utilities/analytics';

export const useDeletePost = <C extends Collection>(collectionName: C, postId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => deletePost(collectionName, postId),
		onSuccess: () => {
			const cached = queryClient.getQueryData<PostWithCreatorInfo<C> | null>([
				'postDetail',
				collectionName,
				postId,
			]);

			if (cached) {
				if (collectionName === 'Boards') {
					logPostDelete({
						post_type: 'Boards',
						trade_type: cached.type as MarketType,
						comment_count: cached.commentCount,
					});
				} else {
					logPostDelete({
						post_type: 'Communities',
						category: cached.type as CommunityType,
						comment_count: cached.commentCount,
					});
				}
			}

			queryClient.removeQueries({ queryKey: ['postDetail', collectionName, postId] });
			queryClient.invalidateQueries({ queryKey: ['posts', collectionName] });
		},
	});
};
