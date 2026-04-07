import { StyleSheet, Text, View } from 'react-native';

import { CommentsListProps } from '@/types/components';

import CommentListSkeleton from './CommentListSkeleton';
import CommentUnit from './CommentUnit';

const CommentsList = ({
	postId,
	postCreatorId,
	postCommentCount,
	comments,
	chatRoomIds,
	collectionName,
	containerStyle,
	isCommentsLoading,
	onReportClick,
	onEditCommentClick,
	onReplyClick,
	onEditReplyClick,
}: CommentsListProps) => {
	return (
		<View style={[styles.container, containerStyle]}>
			<Text style={styles.commentHeader}>댓글 ({postCommentCount})</Text>

			{isCommentsLoading ? (
				<CommentListSkeleton />
			) : (
				<View>
					{comments.map((item) => (
						<CommentUnit
							key={item.id}
							postId={postId}
							postCreatorId={postCreatorId}
							chatRoomIds={chatRoomIds}
							collectionName={collectionName}
							onReportClick={onReportClick}
							onEditCommentClick={onEditCommentClick}
							onReplyClick={onReplyClick}
							onEditReplyClick={onEditReplyClick}
							{...item}
						/>
					))}
				</View>
			)}
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
});

export default CommentsList;
