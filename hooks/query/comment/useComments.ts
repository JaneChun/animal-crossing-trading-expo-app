import { db } from '@/fbase';
import { fetchAndPopulateUsers } from '@/firebase/services/postService';
import { Comment, CommentDoc, CommentWithCreatorInfo } from '@/types/comment';
import { Collection } from '@/types/components';
import { DocumentData } from '@google-cloud/firestore';
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

	const { data } = await fetchAndPopulateUsers<Comment, CommentWithCreatorInfo>(
		q,
		(doc: DocumentData, id: string) => ({ id, ...doc } as CommentDoc),
	);

	return data;
};

const useComments = (collectionName: Collection, postId: string) => {
	return useQuery<CommentWithCreatorInfo[]>({
		queryKey: ['comments', collectionName, postId],
		queryFn: () => fetchComments(collectionName, postId),
		enabled: !!collectionName && !!postId,
	});
};

export default useComments;
