import { deleteComment } from '@/firebase/services/commentService';
import { Collection, PaginatedPosts } from '@/types/post';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeleteComment = (collectionName: Collection, postId: string, commentId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => deleteComment(collectionName, postId, commentId),
		onSuccess: ({ replyCount }) => {
			// 댓글 1개 + 답글 개수만큼 총 댓글 수 감소
			const totalDecrement = 1 + replyCount;

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
									? { ...post, commentCount: Math.max(0, post.commentCount - totalDecrement) }
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
					commentCount: Math.max(0, oldData.commentCount - totalDecrement),
				};
			});

			// 3. 댓글 목록 갱신
			queryClient.invalidateQueries({
				queryKey: ['comments', collectionName, postId],
			});
		},
	});
};
