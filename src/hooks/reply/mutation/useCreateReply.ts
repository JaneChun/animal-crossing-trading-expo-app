import { createReply } from '@/firebase/services/replyService';
import { Collection, PaginatedPosts } from '@/types/post';
import { CreateReplyRequest } from '@/types/reply';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateReply = (collectionName: Collection, postId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			commentId,
			requestData,
			userId,
		}: {
			commentId: string;
			requestData: CreateReplyRequest;
			userId: string;
		}) =>
			createReply({
				collectionName,
				postId,
				commentId,
				requestData,
				userId,
			}),
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

			// 3. 답글 목록 갱신
			queryClient.invalidateQueries({
				queryKey: ['replies', collectionName, postId],
			});
		},
	});
};
