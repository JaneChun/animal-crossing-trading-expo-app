import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
	collection,
	DocumentData,
	getDocs,
	limit,
	orderBy,
	query,
	QueryDocumentSnapshot,
	serverTimestamp,
	startAfter,
	where,
} from 'firebase/firestore';
import { db } from '@/fbase';
import { CartItem } from '@/screens/NewPost';
import { getCreatorInfo } from '@/utilities/firebaseApi';

interface doc {
	id: string;
	type: 'buy' | 'sell' | 'done';
	title: string;
	body: string;
	images: string[];
	creatorId: string;
	createdAt: ReturnType<typeof serverTimestamp>;
	cart: CartItem[];
}
export interface Post extends doc {
	creatorDisplayName: string;
	creatorIslandName: string;
	creatorPhotoURL: string;
}

const useGetPosts = (filter?: { creatorId?: string }, pageSize = 10) => {
	const [data, setData] = useState<Post[]>([]);
	const lastestDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(
		null,
	); // 마지막으로 불러온 문서 (다음 데이터를 가져올 때 사용)
	const [isEnd, setIsEnd] = useState<boolean>(false); // 더 이상 불러올 데이터가 없을 경우 true
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const memoizedFilter = useMemo(() => filter, [filter?.creatorId]);

	const fetchData = useCallback(
		async (isLoadMore = false) => {
			if (isLoading || isEnd) return; // 중복 요청 또는 데이터 끝이면 실행하지 않음

			setIsLoading(true);

			try {
				// 기본 쿼리: 최신순 정렬 후 pageSize만큼 가져옴
				let q = query(
					collection(db, 'Boards'),
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

				// Firebase에서 데이터 가져오기
				const querySnapshot = await getDocs(q);

				// 더 이상 불러올 데이터가 없는 경우 종료
				if (querySnapshot.empty) {
					setIsEnd(true);
					setIsLoading(false);
					return;
				}

				// 현재 가져온 문서들 중 마지막 문서를 저장 (다음 요청을 위해 필요)
				const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
				lastestDocRef.current = newLastDoc;

				// 데이터 변환
				const newData: Post[] = await Promise.all(
					querySnapshot.docs.map(async (doc) => {
						const docData = doc.data();
						const creatorInfo = await getCreatorInfo(docData.creatorId);
						return {
							id: doc.id,
							...docData,
							...creatorInfo,
						} as Post;
					}),
				);

				// 기존 데이터에 추가 or 초기화
				setData((prevData) =>
					isLoadMore ? [...prevData, ...newData] : newData,
				);
			} catch (e) {
				console.log('데이터 Fetch중 에러:', e);
			} finally {
				setIsLoading(false);
			}
		},
		[memoizedFilter, pageSize, isEnd, isLoading],
	);

	// 초기 로드
	useEffect(() => {
		refresh();
	}, [memoizedFilter, pageSize]);

	const refresh = useCallback(() => {
		setIsEnd(false);
		setData([]);
		lastestDocRef.current = null;

		fetchData(false);
	}, [fetchData]);

	const loadMore = useCallback(() => {
		if (isLoading || isEnd) return;

		fetchData(true);
	}, [fetchData, isLoading, isEnd]);

	return { data, isLoading, isEnd, loadMore, refresh };
};

export default useGetPosts;
