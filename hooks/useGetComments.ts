import { fetchAndPopulateUsers } from '@/firebase/api/fetchAndPopulateUsers';
import { Comment, CommentWithCreatorInfo } from '@/types/comment';
import { Collection } from '@/types/components';
import { collection, orderBy, query } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../fbase';

function useGetComments(collectionName: Collection, postId: string) {
	const [comments, setComments] = useState<CommentWithCreatorInfo[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const fetchData = useCallback(async () => {
		if (!postId || isLoading) return; // 중복 요청이면 실행하지 않음

		setIsLoading(true);

		let q = query(
			collection(db, `${collectionName}/${postId}/Comments`),
			orderBy('createdAt', 'asc'),
		);

		const { data } = await fetchAndPopulateUsers<
			Comment,
			CommentWithCreatorInfo
		>(q);

		setComments(data);
		setIsLoading(false);
	}, [postId]);

	const refresh = useCallback(async () => {
		setComments([]);

		fetchData();
	}, [fetchData]);

	// 초기 로드
	useEffect(() => {
		refresh();
	}, [postId, refresh]);

	return { comments, isLoading, refresh };
}

export default useGetComments;
