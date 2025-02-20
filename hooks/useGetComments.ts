import {
	collection,
	getDocs,
	orderBy,
	query,
	Timestamp,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../fbase';

export interface Comment {
	id: string;
	body: string;
	creatorId: string;
	createdAt: Timestamp;
	updatedAt?: Timestamp;
}

function useGetComments(postId: string) {
	const [comments, setComments] = useState<Comment[]>([]);
	const [commentsError, setCommentsError] = useState<Error | null>(null);
	const [isCommentsLoading, setIsCommentsLoading] = useState<boolean>(true);

	const fetchData = useCallback(async () => {
		if (!postId) return;

		setIsCommentsLoading(true);

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
	}, [postId]);

	const refresh = useCallback(async () => {
		setComments([]);
		setCommentsError(null);

		fetchData();
	}, [fetchData]);

	// 초기 로드
	useEffect(() => {
		refresh();
	}, [postId, refresh]);

	return { comments, commentsError, isCommentsLoading, refresh };
}

export default useGetComments;
