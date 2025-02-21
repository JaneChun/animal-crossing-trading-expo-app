import { db } from '@/fbase';
import { postDoc } from '@/firebase/services/postService';
import { getPublicUserInfos } from '@/firebase/services/userService';
import {
	collection,
	DocumentData,
	getDocs,
	limit,
	orderBy,
	query,
	QueryDocumentSnapshot,
	startAfter,
	where,
} from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface Post extends postDoc {
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

	const memoizedFilter = useMemo(() => filter, [JSON.stringify(filter)]);

	const fetchData = useCallback(
		async (isLoadMore = false) => {
			if (isLoading || isEnd) return; // 중복 요청 또는 데이터 끝이면 실행하지 않음

			setIsLoading(true);

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

			try {
				// 1. 게시글 목록 조회
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
				const posts = querySnapshot.docs.map((doc) => {
					const docData = doc.data();

					return {
						id: doc.id,
						...docData,
					} as Post;
				});

				// 2. 게시글 목록에서 creatorId 추출
				const uniqueCreatorIds: string[] = [
					...new Set(posts.map((post: any) => post.creatorId)),
				];

				// 3. 유저 정보 한 번에 조회
				const publicUserInfos = await getPublicUserInfos(uniqueCreatorIds);

				// 4. 게시글과 유저 정보를 합쳐서 최종 데이터 생성
				const newData = posts.map((post) => {
					const { displayName, islandName, photoURL } =
						publicUserInfos[post.creatorId];

					return {
						...post,
						displayName,
						islandName,
						photoURL,
					} as Post;
				});

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

	const refresh = useCallback(() => {
		setIsEnd(false);
		setData([]);
		lastestDocRef.current = null;

		fetchData(false);
	}, [fetchData]);

	// 초기 로드
	useEffect(() => {
		refresh();
	}, [memoizedFilter, pageSize]);

	const loadMore = useCallback(() => {
		if (isLoading || isEnd) return;

		fetchData(true);
	}, [fetchData, isLoading, isEnd]);

	return { data, isLoading, isEnd, loadMore, refresh };
};

export default useGetPosts;
