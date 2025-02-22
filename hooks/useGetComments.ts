import { queryDocs } from '@/firebase/core/firestoreService';
import { getPublicUserInfos } from '@/firebase/services/userService';
import { Comment, CommentWithCreatorInfo } from '@/types/comment';
import { PublicUserInfo } from '@/types/user';
import { collection, orderBy, query } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../fbase';

function useGetComments(postId: string) {
	const [comments, setComments] = useState<CommentWithCreatorInfo[]>([]);
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
				...new Set(data.map((comment: Comment) => comment.creatorId)),
			];

			// 3. 유저 정보 한 번에 조회
			const publicUserInfos: Record<string, PublicUserInfo> =
				await getPublicUserInfos(uniqueCreatorIds);

			// 4. 댓글과 유저 정보를 합쳐서 최종 데이터 생성
			const populatedComments: CommentWithCreatorInfo[] = data.map(
				(comment) => {
					const { displayName, islandName, photoURL } =
						publicUserInfos[comment.creatorId];

					return {
						...comment,
						creatorDisplayName: displayName,
						creatorIslandName: islandName,
						creatorPhotoURL: photoURL,
					};
				},
			);

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
