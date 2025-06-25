import { showToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/AuthStore';
import { CreateCommentRequest, UpdateCommentRequest } from '@/types/comment';
import { OpenEditCommentModalParams } from '@/types/components';
import { Collection } from '@/types/post';
import { navigateToLogin } from '@/utilities/navigationHelpers';
import { Dispatch, SetStateAction, useState } from 'react';
import { useCreateComment } from '../comment/mutation/useCreateComment';
import { useUpdateComment } from '../comment/mutation/useUpdateComment';
import useComments from '../comment/query/useComments';

export const usePostComment = (
	collectionName: Collection,
	id: string,
	setShouldScroll: Dispatch<SetStateAction<boolean>>,
) => {
	const userInfo = useAuthStore((state) => state.userInfo);

	// edit comment modal state
	const [isEditCommentModalVisible, setIsEditCommentModalVisible] =
		useState<boolean>(false);
	const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
	const [editingCommentText, setEditingCommentText] = useState<string>('');

	const { data: comments = [], isLoading: isCommentsFetching } = useComments(
		collectionName as Collection,
		id,
	);
	const { mutate: createComment, isPending: isCommentCreating } =
		useCreateComment({
			collectionName: collectionName as Collection,
			postId: id,
		});
	const { mutate: updateComment, isPending: isCommentUpdating } =
		useUpdateComment({
			collectionName: collectionName as Collection,
			postId: id,
		});

	const openEditCommentModal = ({
		commentId,
		commentText,
	}: OpenEditCommentModalParams) => {
		setEditingCommentId(commentId);
		setEditingCommentText(commentText);
		setIsEditCommentModalVisible(true);
	};

	const closeEditCommentModal = () => {
		setEditingCommentId(null);
		setEditingCommentText('');
		setIsEditCommentModalVisible(false);
	};

	const onSubmitComment = async (commentInput: string) => {
		if (!userInfo) return;

		const requestData: CreateCommentRequest = {
			body: commentInput,
		};

		createComment(
			{ requestData, userId: userInfo.uid },
			{
				onSuccess: async (id) => {
					setShouldScroll(true);
					showToast('success', '댓글이 등록되었습니다.');
				},
				onError: (e) => {
					showToast('error', '댓글 등록 중 오류가 발생했습니다.');
				},
			},
		);
	};

	const onUpdateComment = async (commentText: string) => {
		if (!userInfo) {
			showToast('warn', '댓글 쓰기는 로그인 후 가능합니다.');
			navigateToLogin();
			return;
		}

		if (!editingCommentId) {
			showToast('error', '댓글을 찾을 수 없습니다.');
			return;
		}

		const requestData: UpdateCommentRequest = {
			body: commentText,
		};

		updateComment(
			{ commentId: editingCommentId, requestData },
			{
				onSuccess: () => {
					setIsEditCommentModalVisible(false);
					showToast('success', '댓글이 수정되었습니다.');
				},
				onError: (e) => {
					showToast('error', '댓글 수정 중 오류가 발생했습니다.');
				},
			},
		);
	};

	return {
		comments,
		createComment: onSubmitComment,
		updateComment: onUpdateComment,
		isEditCommentModalVisible,
		editingCommentText,
		openEditCommentModal,
		closeEditCommentModal,
		isCommentsLoading:
			isCommentsFetching || isCommentCreating || isCommentUpdating,
	};
};
