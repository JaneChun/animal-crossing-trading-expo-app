import { db } from '@/fbase';
import { fetchAndPopulateUsers } from '@/firebase/api/fetchAndPopulateUsers';
import { CommentWithCreatorInfo } from '@/types/comment';
import { Collection } from '@/types/components';
import { useQuery } from '@tanstack/react-query';
import { collection, orderBy, query } from 'firebase/firestore';

const fetchComments = async (
	collectionName: Collection,
	postId: string,
): Promise<CommentWithCreatorInfo[]> => {
	const q = query(
		collection(db, `${collectionName}/${postId}/Comments`),
		orderBy('createdAt', 'asc'),
	);

	const { data } = await fetchAndPopulateUsers(q);
	return data;
};

const useComments = (collectionName: Collection, postId: string) => {
	return useQuery<CommentWithCreatorInfo[]>({
		queryKey: ['comments', collectionName, postId],
		queryFn: () => fetchComments(collectionName, postId),
		enabled: !!collectionName && !!postId,
		staleTime: 1000 * 60,
		retry: 1,
	});
};

export default useComments;
