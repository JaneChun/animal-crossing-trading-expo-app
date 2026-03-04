import { useQuery } from '@tanstack/react-query';
import { collection, orderBy, query } from 'firebase/firestore';

import { db } from '@/config/firebase';
import { fetchAndPopulateUsers } from '@/firebase/services/commentService';
import { Comment, CommentWithCreatorInfo } from '@/types/comment';
import { Collection } from '@/types/post';

const fetchComments = async (
	collectionName: Collection,
	postId: string,
): Promise<CommentWithCreatorInfo[]> => {
	const q = query(
		collection(db, `${collectionName}/${postId}/Comments`),
		orderBy('createdAt', 'asc'),
	);

	const result = await fetchAndPopulateUsers<Comment, CommentWithCreatorInfo>(q);

	return result?.data ?? [];
};

const useComments = (collectionName: Collection, postId: string) => {
	return useQuery<CommentWithCreatorInfo[]>({
		queryKey: ['comments', collectionName, postId],
		queryFn: () => fetchComments(collectionName, postId),
		enabled: !!collectionName && !!postId,
	});
};

export default useComments;
