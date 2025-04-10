import { auth } from '@/fbase';
import { addComment } from '@/firebase/services/commentService';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import { useAuthStore } from '@/stores/AuthStore';
import { addCommentRequest } from '@/types/comment';
import { CommentInputProps } from '@/types/components';
import { TabNavigation } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import Input from '../ui/Input';
import { showToast } from '../ui/Toast';

const CommentInput = ({
	postId,
	setIsLoading,
	postRefresh,
	commentRefresh,
}: CommentInputProps) => {
	const activeTab = useActiveTabStore((state) => state.activeTab);
	const isMarket = activeTab === 'Home' || activeTab === 'Profile';
	const collectionName = isMarket ? 'Boards' : 'Communities';
	const [commentInput, setCommentInput] = useState<string>('');
	const tabNavigation = useNavigation<TabNavigation>();
	const userInfo = useAuthStore((state) => state.userInfo);

	const resetForm = () => {
		setCommentInput('');
	};

	const onSubmit = async () => {
		if (!userInfo || !auth.currentUser) {
			showToast('warn', '댓글 쓰기는 로그인 후 가능합니다.');
			tabNavigation.navigate('ProfileTab', { screen: 'Login' });
			return;
		}

		if (!postId) {
			showToast('error', '게시글을 찾을 수 없습니다.');
			tabNavigation.navigate('ProfileTab', { screen: 'Login' });
			return;
		}

		if (commentInput.trim() === '') return;

		const requestData: addCommentRequest = {
			creatorId: userInfo.uid,
			body: commentInput,
			createdAt: Timestamp.now(),
		};

		try {
			setIsLoading(true);

			await addComment({ collectionName, postId, requestData });

			resetForm();

			postRefresh();
			commentRefresh();

			showToast('success', '댓글이 등록되었습니다.');
		} catch (e) {
			showToast('error', '댓글 등록 중 오류가 발생했습니다.');
		} finally {
			setIsLoading(false);
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
