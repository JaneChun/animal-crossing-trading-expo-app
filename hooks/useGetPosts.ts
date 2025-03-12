import { db } from '@/fbase';
import { fetchAndPopulateUsers } from '@/firebase/api/fetchAndPopulateUsers';
import { Post, PostWithCreatorInfo } from '@/types/post';
import {
	collection,
	DocumentData,
	limit,
	orderBy,
	query,
	QueryDocumentSnapshot,
	startAfter,
	where,
} from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const useGetPosts = (
	collectionName: 'Boards' | 'Communities',
	filter?: { creatorId?: string },
	pageSize = 10,
) => {
	const [data, setData] = useState<PostWithCreatorInfo[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isEnd, setIsEnd] = useState<boolean>(false); // 더 이상 불러올 데이터가 없을 경우 true
	const lastestDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(
		null,
	); // 마지막으로 불러온 문서 (다음 데이터를 가져올 때 사용)

	const memoizedFilter = useMemo(() => filter, [JSON.stringify(filter)]);

	const fetchData = useCallback(
		async (isLoadMore = false) => {
			if (isLoading || isEnd) return; // 중복 요청 또는 데이터 끝이면 실행하지 않음

			setIsLoading(true);

			let q = query(
				collection(db, collectionName),
				orderBy('createdAt', 'desc'),
				limit(pageSize),
			);

			// 특정 유저의 게시글만 가져오는 필터
			if (memoizedFilter?.creatorId) {
				q = query(q, where('creatorId', '==', memoizedFilter.creatorId));
			}

			// 스크롤 시 마지막 문서 이후 데이터 가져오기
			if (isLoadMore && lastestDocRef.current) {
				q = query(q, startAfter(lastestDocRef.current));
			}

			const { data: posts, lastDoc } = await fetchAndPopulateUsers<
				Post,
				PostWithCreatorInfo
			>(q);

			if (!lastDoc) setIsEnd(true);
			lastestDocRef.current = lastDoc;

			// 기존 데이터에 추가 or 초기화
			setData((prevData) => (isLoadMore ? [...prevData, ...posts] : posts));
			setIsLoading(false);
		},
		[collectionName, memoizedFilter, pageSize, isEnd, isLoading],
	);

	const refresh = useCallback(() => {
		setIsEnd(false);
		setData([]);
		lastestDocRef.current = null;

		fetchData(false);
	}, [fetchData, collectionName]);

	// 초기 로드
	useEffect(() => {
		refresh();
	}, [collectionName, memoizedFilter, pageSize]);

	const loadMore = useCallback(() => {
		if (isLoading || isEnd) return;

		fetchData(true);
	}, [fetchData, isLoading, isEnd]);

	return { data, isLoading, isEnd, loadMore, refresh };
};

export default useGetPosts;
