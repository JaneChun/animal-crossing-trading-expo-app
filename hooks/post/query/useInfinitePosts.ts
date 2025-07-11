import { db } from '@/fbase';
import { fetchAndPopulateUsers } from '@/firebase/services/postService';
import { useBlockStore } from '@/stores/block';
import {
	Collection,
	Doc,
	Filter,
	FirestoreQueryParams,
	PaginatedPosts,
	Post,
	PostWithCreatorInfo,
} from '@/types/post';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import {
	collection,
	limit,
	orderBy,
	query,
	startAfter,
	where,
} from 'firebase/firestore';

const PAGE_SIZE = 10;

// Firestore 쿼리 구성 함수
const getFirestoreQuery = ({
	collectionName,
	filter,
	lastDoc,
}: FirestoreQueryParams) => {
	let q = query(
		collection(db, collectionName),
		orderBy('createdAt', 'desc'),
		limit(PAGE_SIZE),
	);

	// 특정 유저의 거래글(마켓)만 가져오는 필터
	if (filter?.creatorId) {
		q = query(
			collection(db, collectionName),
			where('creatorId', '==', filter.creatorId),
			orderBy('createdAt', 'desc'),
			limit(PAGE_SIZE),
		);
	}

	// 특정 카테고리의 게시글(커뮤니티)만 가져오는 필터
	if (filter?.category && filter.category !== 'all') {
		q = query(q, where('type', '==', filter.category));
	}

	// 마지막으로 가져온 문서 다음부터 이어서 가져오기
	if (lastDoc) {
		q = query(q, startAfter(lastDoc));
	}

	return q;
};

// Firestore에서 데이터 페칭
export const fetchPostsByCursor = async <C extends Collection>({
	collectionName,
	filter,
	lastDoc = null,
}: FirestoreQueryParams): Promise<PaginatedPosts<C>> => {
	const q = getFirestoreQuery({ collectionName, filter, lastDoc });
	const { data, lastDoc: _lastDoc } = await fetchAndPopulateUsers<
		C,
		Post<C>,
		PostWithCreatorInfo<C>
	>(q);
	return { data, lastDoc: _lastDoc };
};

export const useInfinitePosts = <C extends Collection>(
	collectionName: C,
	filter?: Filter,
) => {
	const blockedUsers = useBlockStore((s) => s.blockedUsers);
	const blockedBy = useBlockStore((s) => s.blockedBy);

	return useInfiniteQuery<
		PaginatedPosts<C>, // fetch 함수 반환 타입
		Error, // 에러 타입
		InfiniteData<PaginatedPosts<C>>, // 리턴될 data 타입
		[string, Collection, Filter?], // queryKey 타입
		Doc // pageParam의 타입
	>({
		queryKey: ['posts', collectionName, filter],
		queryFn: ({ pageParam }) =>
			fetchPostsByCursor({ collectionName, filter, lastDoc: pageParam }),
		initialPageParam: null,
		getNextPageParam: (lastPage: PaginatedPosts<C>) => lastPage.lastDoc,
		// 클라이언트 측 내가 차단한 유저, 나를 차단한 유저의 글 필터링
		select: (infiniteData) => ({
			pageParams: infiniteData.pageParams,
			pages: infiniteData.pages.map((page) => ({
				data: page.data.filter(
					(post) =>
						!blockedUsers.includes(post.creatorId) &&
						!blockedBy.includes(post.creatorId),
				),
				lastDoc: page.lastDoc,
			})),
		}),
		refetchOnMount: true,
	});
};
