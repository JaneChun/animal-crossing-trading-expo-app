import { useQuery } from '@tanstack/react-query';

import { getPost } from '@/firebase/services/postService';
import { getPublicUserInfo } from '@/firebase/services/userService';
import { Collection, PostWithCreatorInfo } from '@/types/post';

const fetchPostDetail = async <C extends Collection>(
	collectionName: C,
	id: string,
): Promise<PostWithCreatorInfo<C> | null> => {
	const post = await getPost(collectionName, id);
	if (!post) return null;

	const userInfo = await getPublicUserInfo(post.creatorId);

	return {
		...post,
		creatorDisplayName: userInfo.displayName,
		creatorIslandName: userInfo.islandName,
		creatorPhotoURL: userInfo.photoURL,
	} as PostWithCreatorInfo<C>;
};

export const usePostDetail = <C extends Collection>(
	collectionName: C,
	id: string,
	{ includeHidden = false }: { includeHidden?: boolean } = {},
) => {
	return useQuery<PostWithCreatorInfo<C> | null>({
		queryKey: ['postDetail', collectionName, id],
		queryFn: () => {
			if (!collectionName || !id) return null;
			return fetchPostDetail(collectionName, id);
		},
		// 숨김/삭제된 게시글은 보여 주지 않음 (관리자가 게시글 상세로 볼 때만 예외)
		// 캐시에는 원본을 두고 화면마다 거른다. 키를 나누면 댓글 수 등 setQueryData 갱신이 한쪽에만 반영된다
		select: (post) => {
			const isHidden = post?.status === 'hidden' || post?.status === 'deleted';
			return isHidden && !includeHidden ? null : post;
		},
		enabled: !!collectionName && !!id,
	});
};
