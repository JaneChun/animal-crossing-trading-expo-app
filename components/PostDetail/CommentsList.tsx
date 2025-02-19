import { useNavigation } from '@react-navigation/native';
import { FlatList, StyleSheet, Text, View, ViewStyle } from 'react-native';
// import CommentUnit from './CommentUnit';
import { Comment } from '@/hooks/useGetComments';
import { TabNavigation } from '@/types/navigation';
import CommentUnit from './CommentUnit';

const CommentsList = ({
	postId,
	comments,
	containerStyle,
}: {
	postId: string;
	postCreatorId: string;
	comments: Comment[];
	containerStyle?: ViewStyle;
}) => {
	const navigation = useNavigation<TabNavigation>();

	return (
		<View style={[styles.container, containerStyle]}>
			<Text style={styles.commentHeader}>댓글 ({comments.length})</Text>

			<FlatList
				data={comments}
				keyExtractor={({ id }) => id}
				renderItem={({ item }) => <CommentUnit postId={postId} {...item} />}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	commentHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
});

export default CommentsList;
