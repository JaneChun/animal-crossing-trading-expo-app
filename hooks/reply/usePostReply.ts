import { showToast } from '@/components/ui/Toast';
import { useCreateReply } from '@/hooks/reply/mutation/useCreateReply';
import { useUpdateReply } from '@/hooks/reply/mutation/useUpdateReply';
import { useUserInfo } from '@/stores/auth';
import { Collection } from '@/types/post';
import { CreateReplyRequest, UpdateReplyRequest } from '@/types/reply';
import { navigateToLogin } from '@/utilities/navigationHelpers';
import { useIsFetching } from '@tanstack/react-query';
import { useState } from 'react';

export const usePostReply = (collectionName: Collection, postId: string) => {
	const userInfo = useUserInfo();

	// 이 게시글의 모든 답글 쿼리 로딩 상태 추적
	const repliesFetchingCount = useIsFetching({
		queryKey: ['replies', collectionName, postId],
	});

	// Reply mutation hooks
	const { mutate: createReply, isPending: isReplyCreating } = useCreateReply(
		collectionName,
		postId,
	);
	const { mutate: updateReply, isPending: isReplyUpdating } = useUpdateReply({
		collectionName,
		postId,
	});

	// Reply mode state
	const [isReplyMode, setIsReplyMode] = useState(false);
	const [commentId, setCommentId] = useState<string | null>(null);
	const [parentId, setParentId] = useState<string | null>(null);
	const [parentDisplayName, setParentDisplayName] = useState<string | null>(null);

	// Edit reply modal state
	const [isEditReplyModalVisible, setIsEditReplyModalVisible] = useState<boolean>(false);
	const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
	const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
	const [editingReplyText, setEditingReplyText] = useState<string>('');

	// Edit reply modal functions
	const openEditReplyModal = ({
		replyId,
		commentId,
		replyText,
	}: {
		replyId: string;
		commentId: string;
		replyText: string;
	}) => {
		setEditingReplyId(replyId);
		setEditingCommentId(commentId);
		setEditingReplyText(replyText);
		setIsEditReplyModalVisible(true);
	};

	const closeEditReplyModal = () => {
		setEditingReplyId(null);
		setEditingCommentId(null);
		setEditingReplyText('');
		setIsEditReplyModalVisible(false);
	};

	// 답글 버튼 클릭 핸들러
	const handleReplyClick = ({
		commentId: targetCommentId,
		parentId: targetParentId,
		parentDisplayName: targetParentDisplayName,
	}: {
		commentId: string;
		parentId: string;
		parentDisplayName: string;
	}) => {
		setIsReplyMode(true);
		setCommentId(targetCommentId);
		setParentId(targetParentId);
		setParentDisplayName(targetParentDisplayName);
	};

	// 답글 취소 핸들러
	const handleReplyCancel = () => {
		resetReplyState();
	};

	const resetReplyState = () => {
		setIsReplyMode(false);
		setCommentId(null);
		setParentId(null);
		setParentDisplayName(null);
	};

	const onSubmitReply = (replyText: string) => {
		if (!userInfo) {
			showToast('warn', '답글 쓰기는 로그인 후 가능합니다.');
			navigateToLogin();
			return;
		}

		if (!isReplyMode || !commentId || !parentId) {
			return;
		}

		const requestData: CreateReplyRequest = {
			body: replyText,
			parentId: parentId,
		};

		createReply(
			{ commentId: commentId, requestData, userId: userInfo.uid },
			{
				onSuccess: () => {
					resetReplyState();
					showToast('success', '답글이 등록되었습니다.');
				},
				onError: () => {
					showToast('error', '답글 등록 중 오류가 발생했습니다.');
				},
			},
		);
	};

	const onUpdateReply = async (replyText: string) => {
		if (!userInfo) {
			showToast('warn', '답글 수정은 로그인 후 가능합니다.');
			navigateToLogin();
			return;
		}

		if (!editingReplyId || !editingCommentId) {
			showToast('error', '답글을 찾을 수 없습니다.');
			return;
		}

		const requestData: UpdateReplyRequest = {
			body: replyText,
		};

		updateReply(
			{
				commentId: editingCommentId,
				replyId: editingReplyId,
				requestData,
			},
			{
				onSuccess: () => {
					setIsEditReplyModalVisible(false);
					showToast('success', '답글이 수정되었습니다.');
				},
				onError: () => {
					showToast('error', '답글 수정 중 오류가 발생했습니다.');
				},
			},
		);
	};

	return {
		// Reply mode
		isReplyMode,
		parentDisplayName,
		handleReplyClick,
		handleReplyCancel,
		createReply: onSubmitReply,
		updateReply: onUpdateReply,
		// Edit reply
		isEditReplyModalVisible,
		editingReplyText,
		openEditReplyModal,
		closeEditReplyModal,
		// Loading states
		isRepliesLoading: repliesFetchingCount > 0 && !isReplyCreating && !isReplyUpdating,
	};
};
