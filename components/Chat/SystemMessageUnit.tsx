import { usePostDetail } from '@/hooks/query/post/usePostDetail';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { IMessage } from 'react-native-gifted-chat';
import PostNotExist from './PostNotExist';
import PostSummary from './PostSummary';
import PostSummaryLoading from './PostSummaryLoading';

const SystemMessageUnit = ({ message }: { message: IMessage }) => {
	const { postId, collectionName } = useMemo(() => {
		try {
			const { postId, collectionName } = JSON.parse(message.text);
			return { postId, collectionName };
		} catch {
			return { postId: null, collectionName: null };
		}
	}, [message]);

	const { data: post, isLoading: isPostLoading } = usePostDetail(
		collectionName,
		postId,
	);

	return (
		<View style={styles.container}>
			{isPostLoading ? (
				<PostSummaryLoading />
			) : post ? (
				<PostSummary post={post} collectionName={collectionName} />
			) : (
				<PostNotExist />
			)}
		</View>
	);
};

export default SystemMessageUnit;

const styles = StyleSheet.create({
	container: {
		marginVertical: 16,
		marginHorizontal: 24,
	},
});
