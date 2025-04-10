import { Comment, CommentDoc } from '@/types/comment';

export const toComment = (doc: CommentDoc): Comment => ({
	id: doc.id,
	body: doc.body,
	creatorId: doc.creatorId,
	createdAt: doc.createdAt,
});
