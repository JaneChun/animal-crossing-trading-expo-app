import { useQuery } from '@tanstack/react-query';

import { getPost } from '@/firebase/services/postService';
import { getPublicUserInfo } from '@/firebase/services/userService';
import { Collection, PostWithCreatorInfo } from '@/types/post';

const fetchPostDetail = async <C extends Collection>(
	collectionName: C,
	id: string,
): Promise<PostWithCreatorInfo<C> | null> => {
	const post = await getPost(collectionName, id);
	// 숨김/삭제된 게시글은 조회하지 않음
	if (!post || post.status === 'hidden' || post.status === 'deleted') return null;

	const userInfo = await getPublicUserInfo(post.creatorId);

	return {
		...post,
		creatorDisplayName: userInfo.displayName,
		creatorIslandName: userInfo.islandName,
		creatorPhotoURL: userInfo.photoURL,
	} as PostWithCreatorInfo<C>;
};

export const usePostDetail = <C extends Collection>(collectionName: C, id: string) => {
	return useQuery<PostWithCreatorInfo<C> | null>({
		queryKey: ['postDetail', collectionName, id],
		queryFn: () => {
			if (!collectionName || !id) return null;
			return fetchPostDetail(collectionName, id);
		},
		enabled: !!collectionName && !!id,
	});
};
