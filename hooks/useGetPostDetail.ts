import { getPost } from '@/firebase/services/postService';
import { getPublicUserInfo } from '@/firebase/services/userService';
import { Tab } from '@/types/components';
import { Post, PostWithCreatorInfo } from '@/types/post';
import { PublicUserInfo } from '@/types/user';
import { useCallback, useEffect, useState } from 'react';

function useGetPostDetail(tab: Tab, id: string) {
	const [data, setData] = useState<PostWithCreatorInfo | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const fetchData = useCallback(async () => {
		if (!tab || !id) return;

		setIsLoading(true);

		const collectionName = tab === 'market' ? 'Boards' : 'Communities';
		const post: Post | null = await getPost(collectionName, id);
		if (!post) return;

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
