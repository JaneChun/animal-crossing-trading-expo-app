import { Collection, CommonPostFields, Post, PostDoc } from '@/types/post';

export const toPost = <C extends Collection>(
	collectionName: C,
	doc: PostDoc<C>,
): Post<C> => {
	const commonFields: CommonPostFields = {
		id: doc.id,
		title: doc.title,
		body: doc.body,
		creatorId: doc.creatorId,
		createdAt: doc.createdAt,
		commentCount: doc.commentCount,
	};

	if (collectionName === 'Boards') {
		const boardDoc = doc as PostDoc<'Boards'>;
		return {
			...commonFields,
			type: boardDoc.type,
			cart: boardDoc.cart,
			chatRoomIds: boardDoc.chatRoomIds,
			reviewPromptSent: boardDoc.reviewPromptSent,
		} as Post<C>;
	}

	const communityDoc = doc as PostDoc<'Communities'>;
	return {
		...commonFields,
		type: communityDoc.type,
		images: communityDoc.images,
	} as Post<C>;
};
