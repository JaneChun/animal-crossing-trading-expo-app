import {
	CartItem,
	Collection,
	CommonPostFields,
	CommunityType,
	MarketType,
	Post,
	PostDoc,
} from '@/types/post';

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
			type: boardDoc.type as MarketType,
			cart: boardDoc.cart as CartItem[],
			chatRoomIds: boardDoc.chatRoomIds,
		} as Post<C>;
	}

	const communityDoc = doc as PostDoc<'Communities'>;
	return {
		...commonFields,
		type: communityDoc.type as CommunityType,
		images: communityDoc.images,
	} as Post<C>;
};
