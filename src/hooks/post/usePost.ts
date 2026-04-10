import { useEffect, useRef } from 'react';

import { showToast } from '@/components/ui/Toast';
import { sendReviewSystemMessage } from '@/firebase/services/reviewService';
import { useMarkAsRead } from '@/hooks/notification/query/mutation/useMarkAsRead';
import { goBack } from '@/navigation/RootNavigation';
import { Collection } from '@/types/post';
import { logPostMarkDone, logPostView } from '@/utilities/analytics';
import { isBoardPost, isCommunityPost } from '@/utilities/typeGuards/postTypeGuards';

import { useDeletePost } from './mutation/useDeletePost';
import { useUpdatePost } from './mutation/useUpdatePost';
import { usePostDetail } from './query/usePostDetail';

export const usePost = (collectionName: Collection, id: string, notificationId: string) => {
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
	}, [notificationId, markAsRead]);

	// 게시글 조회 이벤트 (최초 1회만)
	const hasLoggedView = useRef(false);
	useEffect(() => {
		if (!post || hasLoggedView.current) return;
		hasLoggedView.current = true;
		if (isBoardPost(post, collectionName)) {
			logPostView({ post_type: 'Boards', trade_type: post.type });
		} else if (isCommunityPost(post, collectionName)) {
			logPostView({ post_type: 'Communities', category: post.type });
		}
	}, [collectionName, post]);

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

		try {
			if (!post.reviewPromptSent) {
				await sendReviewSystemMessage({
					postId: post.id,
					chatRoomIds: post.chatRoomIds,
				});
			}
		} catch (error) {
			console.log('리뷰 시스템 메시지 전송 실패', error);
		}

		updatePost(
			{
				type: 'done',
				reviewPromptSent: true,
			},
			{
				onSuccess: () => {
					logPostMarkDone();
					// showToast('success', '거래 완료 처리되었습니다.');
				},
				onError: () => {
					showToast('error', '거래 완료 처리 중 오류가 발생했습니다.');
				},
			},
		);
	};

	return {
		post,
		deletePost: onConfirmDeletePost,
		closePost,
		isPostLoading: isPostFetching || isPostDeleting,
	};
};
