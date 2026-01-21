import { Collection, Post, PostDoc } from '@/types/post';

export const toPost = <C extends Collection>(collectionName: C, doc: PostDoc<C>): Post<C> => {
	// updatedAt은 PostDoc에만 있고 Post에는 없으므로 제외
	const { updatedAt: _updatedAt, ...rest } = doc;

	if (collectionName === 'Communities') {
		const communityPost = rest as unknown as Post<'Communities'>;

		return {
			...communityPost,
			villagers: communityPost.villagers ?? [], // villagers 기본값 처리 (기존 데이터 호환성)
		} as Post<C>;
	}

	return rest as Post<C>;
};
