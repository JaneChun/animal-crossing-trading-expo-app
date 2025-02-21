import { queryDocs } from '@/firebase/firestoreService';
import { getPublicUserInfos } from '@/firebase/userService';
import { collection, orderBy, query, Timestamp } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../fbase';

interface doc {
	id: string;
	body: string;
	creatorId: string;
	createdAt: Timestamp;
	updatedAt?: Timestamp;
}

export interface Comment extends doc {
	creatorDisplayName: string;
	creatorIslandName: string;
	creatorPhotoURL: string;
}

function useGetComments(postId: string) {
	const [comments, setComments] = useState<Comment[]>([]);
	const [commentsError, setCommentsError] = useState<Error | null>(null);
	const [isCommentsLoading, setIsCommentsLoading] = useState<boolean>(true);

	const fetchData = useCallback(async () => {
		if (!postId) return;

		setIsCommentsLoading(true);

		const q = query(
			collection(db, `Boards/${postId}/Comments`),
			orderBy('createdAt', 'asc'),
		);

		try {
			// 1. 댓글 목록 조회
			const data: Comment[] = await queryDocs(q);

			// 2. 댓글 목록에서 creatorId 추출
			const uniqueCreatorIds: string[] = [
				...new Set(data.map((post: any) => post.creatorId)),
			];

			// 3. 유저 정보 한 번에 조회
			const publicUserInfos = await getPublicUserInfos(uniqueCreatorIds);

			// 4. 댓글과 유저 정보를 합쳐서 최종 데이터 생성
			const populatedComments = data.map((comment) => {
				const { displayName, islandName, photoURL } =
					publicUserInfos[comment.creatorId];

				return {
					...comment,
					creatorDisplayName: displayName,
					creatorIslandName: islandName,
					creatorPhotoURL: photoURL,
				} as Comment;
			});

			setComments(populatedComments);
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
