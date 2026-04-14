import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import { createComment } from '@/firebase/services/commentService';
import { CreateCommentRequest } from '@/types/comment';
import { Collection, PaginatedPosts, PostWithCreatorInfo } from '@/types/post';
import { logCommentCreate, logFirstCommentReceived } from '@/utilities/analytics';

export const useCreateComment = ({
	collectionName,
	postId,
}: {
	collectionName: Collection;
	postId: string;
}) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			requestData,
			userId,
		}: {
			requestData: CreateCommentRequest;
			userId: string;
		}) => createComment({ collectionName, postId, requestData, userId }),
		onSuccess: () => {
			logCommentCreate('comment');

			// 첫 댓글 여부 확인 (setQueryData 호출 전 현재 캐시 기준)
			const cached = queryClient.getQueryData<PostWithCreatorInfo<Collection>>([
				'postDetail',
				collectionName,
				postId,
			]);
			if (cached && cached.commentCount === 0) {
				const createdAtMs =
					typeof cached.createdAt?.toMillis === 'function'
						? cached.createdAt.toMillis()
						: (cached.createdAt as unknown as { seconds: number }).seconds * 1000;
				const postAgeSeconds = Math.floor((Date.now() - createdAtMs) / 1000);
				logFirstCommentReceived(postAgeSeconds, collectionName);
			}

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
								post.id === postId
									? { ...post, commentCount: post.commentCount + 1 }
									: post,
							),
						})),
					};
				},
			);

			// 2. 게시글 상세 데이터에서도 commentCount 증가
			queryClient.setQueryData(
				['postDetail', collectionName, postId],
				(oldData: PostWithCreatorInfo<Collection> | undefined) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						commentCount: oldData.commentCount + 1,
					};
				},
			);

			// 3. 댓글 목록 갱신
			queryClient.invalidateQueries({
				queryKey: ['comments', collectionName, postId],
			});
		},
	});
};
