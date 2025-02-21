import { getPost } from '@/firebase/services/postService';
import { getPublicUserInfo } from '@/firebase/services/userService';
import { useCallback, useEffect, useState } from 'react';
import { Post } from './useGetPosts';

type UseGetPostDetailReturnType = {
	post: Post | null;
	error: Error | null;
	isLoading: boolean;
	refresh: () => void;
};

function useGetPostDetail(id: string): UseGetPostDetailReturnType {
	const [data, setData] = useState<Post | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const fetchData = useCallback(async () => {
		if (!id) return;

		setIsLoading(true);

		try {
			const post = await getPost(id);
			if (!post) return;

			const { displayName, islandName, photoURL } = await getPublicUserInfo(
				post.creatorId,
			);

			setData({
				...post,
				creatorDisplayName: displayName,
				creatorIslandName: islandName,
				creatorPhotoURL: photoURL,
			} as Post);
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
