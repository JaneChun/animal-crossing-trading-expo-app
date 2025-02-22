import { getPost } from '@/firebase/services/postService';
import { getPublicUserInfo } from '@/firebase/services/userService';
import { Post, PostWithCreatorInfo } from '@/types/post';
import { PublicUserInfo } from '@/types/user';
import { useCallback, useEffect, useState } from 'react';

function useGetPostDetail(id: string) {
	const [data, setData] = useState<PostWithCreatorInfo | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const fetchData = useCallback(async () => {
		if (!id) return;

		setIsLoading(true);

		try {
			const post: Post | null = await getPost(id);
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
		} catch (e) {
			console.log('데이터 Fetch중 에러:', e);
			setError(e as Error);
		} finally {
			setIsLoading(false);
		}
	}, [id]);

	const refresh = useCallback(() => {
		setData(null);
		setError(null);

		fetchData();
	}, [fetchData]);

	// 초기 로드
	useEffect(() => {
		refresh();
	}, [id, refresh]);

	return { post: data, error, isLoading, refresh };
}

export default useGetPostDetail;
