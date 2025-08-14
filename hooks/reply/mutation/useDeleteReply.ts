import { deleteReply } from '@/firebase/services/replyService';
import { Collection, PaginatedPosts } from '@/types/post';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeleteReply = (
	collectionName: Collection,
	postId: string,
	commentId: string,
	replyId: string,
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => deleteReply(collectionName, postId, commentId, replyId),
		onSuccess: () => {
			// 1. Optimistic Update: posts 쿼리 데이터에서 commentCount 즉시 감소
			queryClient.setQueryData<InfiniteData<PaginatedPosts<typeof collectionName>>>(
				['posts', collectionName],
				(oldData) => {
					if (!oldData) return oldData;

					return {
						...oldData,
						pages: oldData.pages.map((page) => ({
							...page,
							data: page.data.map((post) =>
								post.id === postId
									? { ...post, commentCount: Math.max(0, post.commentCount - 1) }
									: post,
							),
						})),
					};
				},
			);

			// 2. 게시글 상세 데이터에서도 commentCount 감소
			queryClient.setQueryData(['postDetail', collectionName, postId], (oldData: any) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					commentCount: Math.max(0, oldData.commentCount - 1),
				};
			});

			// 3. 답글 목록 갱신
			queryClient.invalidateQueries({
				queryKey: ['replies', collectionName, postId, commentId],
			});
		},
	});
};
