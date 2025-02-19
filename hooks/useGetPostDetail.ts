import { useCallback, useEffect, useState } from 'react';
import { getDocFromFirestore } from '@/utilities/firebaseApi';
import { Post } from './useGetPosts';
import { getCreatorInfo } from '@/utilities/firebaseApi';

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

	const fetchData = async () => {
		if (!id) return;

		setIsLoading(true);

		try {
			const docData = await getDocFromFirestore({ collection: 'Boards', id });
			if (!docData) return;

			const creatorInfo = await getCreatorInfo(docData.creatorId);

			setData({ ...docData, ...creatorInfo } as Post);
		} catch (e) {
			console.log('데이터 Fetch중 에러:', e);
			setError(e as Error);
		} finally {
			setIsLoading(false);
		}
	};

	// 초기 로드
	useEffect(() => {
		refresh();
	}, [id]);

	const refresh = useCallback(() => {
		setData(null);
		setError(null);

		fetchData();
	}, []);

	return { post: data, error, isLoading, refresh };
}

export default useGetPostDetail;
