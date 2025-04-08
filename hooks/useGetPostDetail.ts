import { getPost } from '@/firebase/services/postService';
import { getPublicUserInfo } from '@/firebase/services/userService';
import { Collection } from '@/types/components';
import { Post, PostWithCreatorInfo } from '@/types/post';
import { PublicUserInfo } from '@/types/user';
import { useCallback, useEffect, useState } from 'react';

function useGetPostDetail(collectionName: Collection, id: string) {
	const [data, setData] = useState<PostWithCreatorInfo | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const fetchData = useCallback(async () => {
		if (!collectionName || !id) return;

		setIsLoading(true);

		const post: Post | null = await getPost(collectionName, id);
		if (!post) {
			setIsLoading(false);
			return;
		}

		const publicUserInfo: PublicUserInfo = await getPublicUserInfo(
			post.creatorId,
		);
		const { displayName, islandName, photoURL } = publicUserInfo;

		setData({
			...post,
			creatorDisplayName: displayName,
			creatorIslandName: islandName,
			creatorPhotoURL: photoURL,
		});
		setIsLoading(false);
	}, [id]);

	const refresh = useCallback(() => {
		setData(null);

		fetchData();
	}, [fetchData]);

	// 초기 로드
	useEffect(() => {
		refresh();
	}, [id, refresh]);

	return { post: data, isLoading, refresh };
}

export default useGetPostDetail;
