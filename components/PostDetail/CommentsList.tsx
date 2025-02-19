import { Comment } from '@/hooks/useGetComments';
import { FlatList, StyleSheet, Text, View, ViewStyle } from 'react-native';
import CommentUnit from './CommentUnit';

const CommentsList = ({
	postId,
	postCreatorId,
	comments,
	containerStyle,
	commentRefresh,
}: {
	postId: string;
	postCreatorId: string;
	comments: Comment[];
	containerStyle?: ViewStyle;
	commentRefresh: () => void;
}) => {
	return (
		<View style={[styles.container, containerStyle]}>
			<Text style={styles.commentHeader}>댓글 ({comments.length})</Text>

			<FlatList
				data={comments}
				keyExtractor={({ id }) => id}
				renderItem={({ item }) => (
					<CommentUnit
						commentRefresh={commentRefresh}
						postId={postId}
						postCreatorId={postCreatorId}
						{...item}
					/>
				)}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	commentHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
});

export default CommentsList;
