import Layout from '@/components/ui/Layout';
import { useAuthContext } from '@/contexts/AuthContext';
import { auth } from '@/fbase';
import useLoading from '@/hooks/useLoading';
import { EditCommentRouteProp, TabNavigation } from '@/types/navigation';
import { updateComment } from '@/utilities/firebaseApi';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput } from 'react-native';
import Button from '../components/ui/Button';

const EditComment = () => {
	const route = useRoute<EditCommentRouteProp>();
	const { commentId, postId, comment } = route.params;
	const navigation = useNavigation<TabNavigation>();
	const { userInfo } = useAuthContext();
	const { isLoading, setIsLoading, LoadingIndicator } = useLoading();
	const [newCommentInput, setNewCommentInput] = useState('');

	const isValid = newCommentInput?.length > 0;

	useEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<Button
					disabled={isLoading || !isValid}
					color='white'
					size='md2'
					onPress={onSubmit}
				>
					완료
				</Button>
			),
			headerLeft: () => (
				<Button color='gray' size='md2' onPress={() => navigation.goBack()}>
					취소
				</Button>
			),
		});
	}, [newCommentInput, isValid, isLoading, navigation]);

	useEffect(() => {
		setNewCommentInput(comment);
	}, [comment]);

	const onSubmit = () => {
		if (!userInfo || !auth.currentUser) {
			Alert.alert('댓글 쓰기는 로그인 후 가능합니다.');
			navigation.navigate('Login');
			return;
		}

		if (newCommentInput.trim() === '') {
			Alert.alert('오류', '내용이 비어있는지 확인해주세요.');
			return;
		}

		try {
			setIsLoading(true);
			updateComment({ postId, commentId, newCommentText: newCommentInput });
		} catch (e: any) {
			Alert.alert(
				'오류',
				`댓글을 작성하는 중 오류가 발생했습니다.${e.code && `\n${e.code}`}`,
			);
		} finally {
			setNewCommentInput('');
			setIsLoading(false);
			navigation.goBack();
		}
	};

	if (isLoading) {
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
