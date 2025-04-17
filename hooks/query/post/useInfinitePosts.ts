import { db } from '@/fbase';
import { fetchAndPopulateUsers } from '@/firebase/services/postService';
import {
	Collection,
	Doc,
	Filter,
	FirestoreQueryParams,
	PaginatedPosts,
	Post,
	PostDoc,
	PostWithCreatorInfo,
} from '@/types/post';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import {
	collection,
	DocumentData,
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
		where('isDeleted', '!=', true),
		orderBy('isDeleted'),
		orderBy('createdAt', 'desc'),
		limit(PAGE_SIZE),
	);

	// 특정 유저의 거래글(마켓)만 가져오는 필터
	if (filter?.creatorId) {
		q = query(
			collection(db, collectionName),
			where('creatorId', '==', filter.creatorId),
			where('isDeleted', '!=', true),
			orderBy('isDeleted'),
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
		Post<C>,
		PostWithCreatorInfo<C>
	>(q, (doc: DocumentData, id: string) => ({ id, ...doc } as PostDoc<C>));
	return { data, lastDoc: _lastDoc };
};

export const useInfinitePosts = <C extends Collection>(
	collectionName: C,
	filter?: Filter,
) => {
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
	});
};
