import Layout, { PADDING } from '@/components/ui/Layout';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { showToast } from '@/components/ui/Toast';
import { auth } from '@/fbase';
import { useUpdateComment } from '@/hooks/mutation/comment/useUpdateComment';
import { goBack } from '@/navigation/RootNavigation';
import { useActiveTabStore } from '@/stores/ActiveTabstore';
import { useAuthStore } from '@/stores/AuthStore';
import { UpdateCommentRequest } from '@/types/comment';
import { EditCommentRouteProp, RootStackNavigation } from '@/types/navigation';
import { navigateToLogin } from '@/utilities/navigationHelpers';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import Button from '../components/ui/Button';

const EditComment = () => {
	const activeTab = useActiveTabStore((state) => state.activeTab);
	const isMarket = activeTab === 'Home' || activeTab === 'Profile';
	const collectionName = isMarket ? 'Boards' : 'Communities';
	const route = useRoute<EditCommentRouteProp>();
	const { commentId, postId, body } = route.params;
	const stackNavigation = useNavigation<RootStackNavigation>();
	const userInfo = useAuthStore((state) => state.userInfo);
	const [newCommentInput, setNewCommentInput] = useState('');
	const { mutate: updateComment, isPending: isUpdating } = useUpdateComment(
		collectionName,
		postId,
		commentId,
	);

	const isValid = newCommentInput?.length > 0;

	useEffect(() => {
		stackNavigation.setOptions({
			headerRight: () => (
				<Button
					disabled={isUpdating || !isValid}
					color='white'
					size='md2'
					onPress={onSubmit}
				>
					완료
				</Button>
			),
			headerLeft: () => (
				<Button color='gray' size='md2' onPress={goBack}>
					취소
				</Button>
			),
		});
	}, [newCommentInput, isValid, isUpdating, stackNavigation]);

	useEffect(() => {
		setNewCommentInput(body);
	}, [body]);

	const resetForm = () => {
		setNewCommentInput('');
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

		if (newCommentInput.trim() === '') return;

		const requestData: UpdateCommentRequest = {
			body: newCommentInput,
			updatedAt: Timestamp.now(),
		};

		updateComment(requestData, {
			onSuccess: () => {
				resetForm();
				goBack();
				showToast('success', '댓글이 수정되었습니다.');
			},
			onError: (e) => {
				showToast('error', '댓글 수정 중 오류가 발생했습니다.');
			},
		});
	};

	if (isUpdating) {
		return <LoadingIndicator />;
	}

	return (
		<Layout containerStyle={{ padding: PADDING }}>
			<TextInput
				style={styles.textInput}
				value={newCommentInput}
				onChangeText={setNewCommentInput}
				multiline
			/>
		</Layout>
	);
};

export default EditComment;

const styles = StyleSheet.create({
	textInput: {
		fontSize: 16,
	},
});
