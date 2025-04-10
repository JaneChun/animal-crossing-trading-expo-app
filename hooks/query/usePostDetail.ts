import { getPost } from '@/firebase/services/postService';
import { getPublicUserInfo } from '@/firebase/services/userService';
import { Collection } from '@/types/components';
import { PostWithCreatorInfo } from '@/types/post';
import { useQuery } from '@tanstack/react-query';

const fetchPostDetail = async (
	collectionName: Collection,
	id: string,
): Promise<PostWithCreatorInfo | null> => {
	const post = await getPost(collectionName, id);
	if (!post) return null;

	const userInfo = await getPublicUserInfo(post.creatorId);

	return {
		...post,
		creatorDisplayName: userInfo.displayName,
		creatorIslandName: userInfo.islandName,
		creatorPhotoURL: userInfo.photoURL,
	};
};

export const usePostDetail = (collectionName: Collection, id: string) => {
	return useQuery({
		queryKey: ['postDetail', collectionName, id],
		queryFn: () => fetchPostDetail(collectionName, id),
		enabled: !!collectionName && !!id,
		staleTime: 1000 * 60 * 5,
		retry: 1,
	});
};
