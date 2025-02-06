import { DocumentData } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getDocFromFirestore } from '@/utilities/firebaseApi';

type UseGetPostDetailReturnType = {
	post: DocumentData | null;
	error: Error | null;
	loading: boolean;
};

function useGetPostDetail(
	id: string,
	isUpdated?: boolean,
): UseGetPostDetailReturnType {
	const [data, setData] = useState<DocumentData>({});
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	if (!id) return { post: null, error: null, loading: false };

	useEffect(() => {
		setLoading(true);
		setError(null);
		setData({});

		const getData = async () => {
			try {
				const docData = await getDocFromFirestore({ collection: 'Boards', id });
				if (!docData) return;

				setData(docData);
			} catch (e) {
				setError(e as Error);
			} finally {
				setLoading(false);
			}
		};

		getData();
	}, [id, isUpdated]);

	return { post: data, error, loading };
}

export default useGetPostDetail;
