import { Post, PostDoc } from '@/types/post';

export const toPost = (doc: PostDoc): Post => ({
	id: doc.id,
	type: doc.type,
	title: doc.title,
	body: doc.body,
	cart: doc.cart,
	images: doc.images,
	creatorId: doc.creatorId,
	createdAt: doc.createdAt,
	commentCount: doc.commentCount,
});
