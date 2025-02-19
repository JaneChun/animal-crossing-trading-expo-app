import {
	collection,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../fbase';

export interface Comment {
	id: string;
	body: string;
	creatorId: string;
	createdAt: ReturnType<typeof serverTimestamp>;
	updatedAt?: ReturnType<typeof serverTimestamp>;
}

function useGetComments(postId: string) {
	const [comments, setComments] = useState<Comment[]>([]);
	const [commentsError, setCommentsError] = useState<Error | null>(null);
	const [isCommentsLoading, setIsCommentsLoading] = useState<boolean>(true);

	const getComments = async () => {
		try {
			const q = query(
				collection(db, `Boards/${postId}/Comments`),
				orderBy('createdAt', 'asc'),
			);

			const querySnapshot = await getDocs(q);

			const data = querySnapshot.docs.map((doc) => {
				const docData = doc.data();

				return {
					id: doc.id,
					...docData,
				} as Comment;
			});

			setComments(data);
		} catch (error: unknown) {
			setCommentsError(error as Error);
		} finally {
			setIsCommentsLoading(false);
		}
	};

	useEffect(() => {
		refresh();
	}, [postId]);

	const refresh = useCallback(async () => {
		setIsCommentsLoading(true);
		setComments([]);
		setCommentsError(null);

		getComments();
	}, [getComments]);

	return { comments, commentsError, isCommentsLoading, refresh };
}

export default useGetComments;
