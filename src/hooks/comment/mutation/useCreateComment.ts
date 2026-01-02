import { createComment } from '@/firebase/services/commentService';
import { CreateCommentRequest } from '@/types/comment';
import { Collection, PaginatedPosts } from '@/types/post';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateComment = ({
	collectionName,
	postId,
}: {
	collectionName: Collection;
	postId: string;
}) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ requestData, userId }: { requestData: CreateCommentRequest; userId: string }) =>
			createComment({ collectionName, postId, requestData, userId }),
		onSuccess: () => {
			// 1. Optimistic Update: posts 쿼리 데이터에서 commentCount 즉시 증가
			queryClient.setQueryData<InfiniteData<PaginatedPosts<typeof collectionName>>>(
				['posts', collectionName],
				(oldData) => {
					if (!oldData) return oldData;

					return {
						...oldData,
						pages: oldData.pages.map((page) => ({
							...page,
							data: page.data.map((post) =>
								post.id === postId ? { ...post, commentCount: post.commentCount + 1 } : post,
							),
						})),
					};
				},
			);

			// 2. 게시글 상세 데이터에서도 commentCount 증가
			queryClient.setQueryData(['postDetail', collectionName, postId], (oldData: any) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					commentCount: oldData.commentCount + 1,
				};
			});

			// 3. 댓글 목록 갱신
			queryClient.invalidateQueries({
				queryKey: ['comments', collectionName, postId],
			});
		},
	});
};
