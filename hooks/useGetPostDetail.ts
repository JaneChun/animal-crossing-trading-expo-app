import { DocumentData } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getDocFromFirestore } from '@/utilities/firebaseApi';
import { Post } from './useGetPosts';
import { getCreatorInfo } from '@/utilities/firebaseApi';

type UseGetPostDetailReturnType = {
	post: Post | null;
	error: Error | null;
	isLoading: boolean;
};

function useGetPostDetail(
	id: string,
	isUpdated?: boolean,
): UseGetPostDetailReturnType {
	const [data, setData] = useState<Post | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		if (!id) {
			setData(null);
			setError(null);
			setIsLoading(false);
			return;
		}

		setData(null);
		setError(null);
		setIsLoading(true);

		const getData = async () => {
			try {
				const docData = await getDocFromFirestore({ collection: 'Boards', id });
				if (!docData) {
					setData(null);
					return;
				}

				const creatorInfo = await getCreatorInfo(docData.creatorId);

				setData({ ...docData, ...creatorInfo } as Post);
			} catch (e) {
				setError(e as Error);
			} finally {
				setIsLoading(false);
			}
		};

		getData();
	}, [id, isUpdated]);

	return { post: data, error, isLoading };
}

export default useGetPostDetail;
