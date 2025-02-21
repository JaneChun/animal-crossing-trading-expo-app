import { Colors } from '@/constants/Color';
import { useAuthContext } from '@/contexts/AuthContext';
import { auth } from '@/fbase';
import { addComment } from '@/firebase/services/commentService';
import { TabNavigation } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { Timestamp } from 'firebase/firestore';
import { Dispatch, SetStateAction, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import Input from '../ui/Input';

const CommentInput = ({
	postId,
	setIsLoading,
	commentRefresh,
}: {
	postId: string;
	setIsLoading: Dispatch<SetStateAction<boolean>>;
	commentRefresh: () => void;
}) => {
	const [commentInput, setCommentInput] = useState<string>('');
	const tabNavigation = useNavigation<TabNavigation>();
	const { userInfo } = useAuthContext();

	const onSubmit = () => {
		if (!userInfo || !auth.currentUser) {
			Alert.alert('댓글 쓰기는 로그인 후 가능합니다.');
			tabNavigation.navigate('ProfileTab', { screen: 'Login' });
			return;
		}

		if (!postId) {
			Alert.alert('게시글을 찾을 수 없습니다.');
			tabNavigation.navigate('ProfileTab', { screen: 'Login' });
			return;
		}

		if (commentInput.trim() === '') {
			Alert.alert('오류', '내용이 비어있는지 확인해주세요.');
			return;
		}

		const commentData = {
			creatorId: userInfo.uid,
			body: commentInput,
			createdAt: Timestamp.now(),
		};

		try {
			setIsLoading(true);
			addComment({ postId, commentData });
			commentRefresh();
		} catch (e: any) {
			Alert.alert(
				'오류',
				`댓글을 작성하는 중 오류가 발생했습니다.${e.code && `\n${e.code}`}`,
			);
		} finally {
			setCommentInput('');
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
