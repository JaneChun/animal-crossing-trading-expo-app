import { auth } from '@/fbase';
import { useCreateComment } from '@/hooks/mutation/comment/useCreateComment';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import { useAuthStore } from '@/stores/AuthStore';
import { CreateCommentRequest } from '@/types/comment';
import { CommentInputProps } from '@/types/components';
import { navigateToLogin } from '@/utilities/navigationHelpers';
import { useState } from 'react';
import Input from '../ui/Input';
import { showToast } from '../ui/Toast';

const CommentInput = ({ postId, setIsCommentUploading }: CommentInputProps) => {
	const activeTab = useActiveTabStore((state) => state.activeTab);
	const isMarket = activeTab === 'Home' || activeTab === 'Profile';
	const collectionName = isMarket ? 'Boards' : 'Communities';
	const [commentInput, setCommentInput] = useState<string>('');
	const userInfo = useAuthStore((state) => state.userInfo);
	const { mutate: createComment, isPending: isCreating } = useCreateComment({
		collectionName,
		postId,
	});

	const resetForm = () => {
		setCommentInput('');
	};

	const onSubmit = async () => {
		if (!userInfo || !auth.currentUser) {
			showToast('warn', '댓글 쓰기는 로그인 후 가능합니다.');
			navigateToLogin();
			return;
		}

		if (!postId) {
			showToast('error', '게시글을 찾을 수 없습니다.');
			navigateToLogin();
			return;
		}

		if (commentInput.trim() === '') return;

		const requestData: CreateCommentRequest = {
			body: commentInput,
		};

		try {
			setIsCommentUploading(true);

			createComment(
				{ requestData, userId: userInfo.uid },
				{
					onSuccess: (id) => {
						resetForm();
						showToast('success', '댓글이 등록되었습니다.');
					},
					onError: (e) => {
						showToast('error', '댓글 등록 중 오류가 발생했습니다.');
					},
				},
			);
		} finally {
			setIsCommentUploading(false);
		}
	};

	return (
		<Input
			input={commentInput}
			setInput={setCommentInput}
			onPress={onSubmit}
			placeholder='댓글을 입력해주세요.'
			marginBottom={101}
		/>
	);
};

export default CommentInput;
