import { showToast } from '@/components/ui/Toast';
import { sendReviewSystemMessage } from '@/firebase/services/reviewService';
import { goBack } from '@/navigation/RootNavigation';
import { Collection } from '@/types/post';
import { isBoardPost } from '@/utilities/typeGuards/postTypeGuards';
import { useEffect } from 'react';
import { useMarkAsRead } from '@/hooks/notification/query/mutation/useMarkAsRead';
import { useDeletePost } from './mutation/useDeletePost';
import { useUpdatePost } from './mutation/useUpdatePost';
import { usePostDetail } from './query/usePostDetail';

export const usePost = (
	collectionName: Collection,
	id: string,
	notificationId: string,
) => {
	const { data: post, isLoading: isPostFetching } = usePostDetail(
		collectionName as Collection,
		id,
	);
	const { mutate: markAsRead } = useMarkAsRead();
	const { mutate: updatePost } = useUpdatePost('Boards', id);
	const { mutate: deletePost, isPending: isPostDeleting } = useDeletePost(
		collectionName as Collection,
		id,
	);

	// 알림 읽음 처리
	useEffect(() => {
		if (notificationId) {
			markAsRead(notificationId);
		}
	}, [notificationId]);

	const onConfirmDeletePost = async () => {
		deletePost(undefined, {
			onSuccess: () => {
				showToast('success', '게시글이 삭제되었습니다.');
				goBack();
			},
			onError: (e) => {
				showToast('error', '게시글 삭제 중 오류가 발생했습니다.');
			},
		});
	};

	const closePost = async () => {
		if (!post || !collectionName || !isBoardPost(post, collectionName)) return;

		if (!post.reviewPromptSent) {
			await sendReviewSystemMessage({
				postId: post.id,
				chatRoomIds: post.chatRoomIds,
			});
		}

		updatePost({
			type: 'done',
			reviewPromptSent: true,
		});
	};

	return {
		post,
		deletePost: onConfirmDeletePost,
		closePost,
		isPostLoading: isPostFetching || isPostDeleting,
	};
};
