import { usePostDetail } from '@/hooks/post/query/usePostDetail';
import { SystemIMessage } from '@/types/chat';
import { StyleSheet, View } from 'react-native';
import PostNotExist from './PostNotExist';
import PostSummary from './PostSummary';
import PostSummaryLoading from './PostSummaryLoading';

const SystemMessageUnit = ({ message }: { message: SystemIMessage }) => {
	const { postId, collectionName } = message.systemPayload;

	const { data: post, isLoading: isPostLoading } = usePostDetail(collectionName, postId);

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
