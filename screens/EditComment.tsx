import Layout from '@/components/ui/Layout';
import { showToast } from '@/components/ui/Toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { auth } from '@/fbase';
import { updateComment } from '@/firebase/services/commentService';
import useLoading from '@/hooks/useLoading';
import { useNavigationStore } from '@/store/store';
import { updateCommentRequest } from '@/types/comment';
import {
	EditCommentRouteProp,
	HomeStackNavigation,
	TabNavigation,
} from '@/types/navigation';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import Button from '../components/ui/Button';

const EditComment = () => {
	const { activeTab } = useNavigationStore();
	const isMarket = activeTab === 'Home' || activeTab === 'Profile';
	const collectionName = isMarket ? 'Boards' : 'Communities';
	const route = useRoute<EditCommentRouteProp>();
	const { commentId, postId, body } = route.params;
	const tabNavigation = useNavigation<TabNavigation>();
	const stackNavigation = useNavigation<HomeStackNavigation>();
	const { userInfo } = useAuthContext();
	const {
		isLoading: isUploading,
		setIsLoading: setIsUploading,
		LoadingIndicator,
	} = useLoading();
	const [newCommentInput, setNewCommentInput] = useState('');

	const isValid = newCommentInput?.length > 0;

	useEffect(() => {
		stackNavigation.setOptions({
			headerRight: () => (
				<Button
					disabled={isUploading || !isValid}
					color='white'
					size='md2'
					onPress={onSubmit}
				>
					완료
				</Button>
			),
			headerLeft: () => (
				<Button
					color='gray'
					size='md2'
					onPress={() => stackNavigation.goBack()}
				>
					취소
				</Button>
			),
		});
	}, [newCommentInput, isValid, isUploading, stackNavigation]);

	useEffect(() => {
		setNewCommentInput(body);
	}, [body]);

	const onSubmit = () => {
		if (!userInfo || !auth.currentUser) {
			showToast('warn', '댓글 쓰기는 로그인 후 가능합니다.');
			tabNavigation.navigate('ProfileTab', { screen: 'Login' });
			return;
		}

		if (newCommentInput.trim() === '') {
			return;
		}

		const requestData: updateCommentRequest = {
			body: newCommentInput,
			updatedAt: Timestamp.now(),
		};

		setIsUploading(true);
		updateComment({ collectionName, postId, commentId, requestData });
		setIsUploading(false);

		setNewCommentInput('');
		stackNavigation.goBack();
		showToast('success', '댓글이 수정되었습니다.');
	};

	if (isUploading) {
		return <LoadingIndicator />;
	}

	return (
		<Layout>
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
