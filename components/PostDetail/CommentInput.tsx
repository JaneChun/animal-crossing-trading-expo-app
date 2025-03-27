import { Colors } from '@/constants/Color';
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
import { StyleSheet } from 'react-native';
import Input from '../ui/Input';
import { showToast } from '../ui/Toast';

const CommentInput = ({
	postId,
	setIsLoading,
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

	const onSubmit = () => {
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

		if (commentInput.trim() === '') {
			return;
		}

		const requestData: addCommentRequest = {
			creatorId: userInfo.uid,
			body: commentInput,
			createdAt: Timestamp.now(),
		};

		setIsLoading(true);

		addComment({ collectionName, postId, requestData });

		setIsLoading(false);

		resetForm();
		commentRefresh();
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

const styles = StyleSheet.create({
	inputContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		backgroundColor: 'white',
		flexDirection: 'row',
		alignItems: 'center',
		borderTopWidth: 1,
		borderColor: Colors.border_gray,
	},
	inputText: {
		flex: 1,
		borderWidth: 1,
		borderColor: Colors.border_gray,
		backgroundColor: Colors.base,
		borderRadius: 20,
		paddingVertical: 10,
		paddingHorizontal: 16,
		margin: 8,
		fontSize: 16,
		color: Colors.font_gray,
	},
	iconContainer: {
		marginRight: 24,
	},
});
