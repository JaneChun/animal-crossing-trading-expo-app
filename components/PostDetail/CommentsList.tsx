import { CommentsListProps } from '@/types/components';
import { StyleSheet, Text, View } from 'react-native';
import CommentUnit from './CommentUnit';

const CommentsList = ({
	postId,
	postCreatorId,
	comments,
	chatRoomIds,
	containerStyle,
	onReportClick,
	onEditClick,
}: CommentsListProps) => {
	return (
		<View style={[styles.container, containerStyle]}>
			<Text style={styles.commentHeader}>댓글 ({comments.length})</Text>

			<View>
				{comments.map((item) => (
					<CommentUnit
						key={item.id}
						postId={postId}
						postCreatorId={postCreatorId}
						chatRoomIds={chatRoomIds}
						onReportClick={onReportClick}
						onEditClick={onEditClick}
						{...item}
					/>
				))}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	commentHeader: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	list: {
		flex: 1,
	},
});

export default CommentsList;
