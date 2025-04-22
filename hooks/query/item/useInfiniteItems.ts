import { db } from '@/fbase';
import { Item, ItemCategory } from '@/types/post';
import { DocumentData } from '@google-cloud/firestore';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import {
	collection,
	DocumentSnapshot,
	getDocs,
	limit,
	orderBy,
	query,
	Query,
	startAfter,
	where,
} from 'firebase/firestore';

const PAGE_SIZE = 50;

type Doc = DocumentSnapshot<DocumentData> | null;

interface ItemFilter {
	category?: ItemCategory;
	keyword?: string;
}

interface PaginatedItems {
	data: Item[];
	lastDoc: Doc;
}

const getFirestoreQuery = ({
	filter,
	lastDoc,
}: {
	filter: ItemFilter;
	lastDoc?: Doc;
}): Query => {
	let q: Query = query(collection(db, 'Items'));

	// 검색 키워드가 있을 경우
	const trimmed = filter.keyword?.trim();
	if (trimmed) {
		q = query(q, where('searchKeywords', 'array-contains', trimmed));
	}

	// 카테고리를 선택한 경우 (카테고리 = 전체 제외)
	if (filter.category && filter.category !== 'All') {
		q = query(q, where('category', '==', filter.category));
	}

	// 정렬 및 페이징
	q = query(q, orderBy('name'), limit(PAGE_SIZE));

	if (lastDoc) {
		q = query(q, startAfter(lastDoc));
	}

	return q;
};

const fetchItemsByCursor = async ({
	filter,
	lastDoc,
}: {
	filter: ItemFilter;
	lastDoc?: Doc;
}): Promise<PaginatedItems> => {
	const q = getFirestoreQuery({ filter, lastDoc });

	const querySnapshot = await getDocs(q);

	if (querySnapshot.empty) return { data: [], lastDoc: null };

	const data = querySnapshot.docs.map((doc) => {
		const docData = doc.data();
		const id = doc.id;

		return {
			...docData,
			id,
		} as Item;
	});

	return { data, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
};

export const useInfiniteItems = (category?: ItemCategory, keyword?: string) => {
	return useInfiniteQuery<
		PaginatedItems,
		Error,
		InfiniteData<PaginatedItems>,
		[string, ItemCategory | undefined, string | undefined],
		Doc
	>({
		queryKey: ['items', category, keyword],
		queryFn: ({ pageParam }) =>
			fetchItemsByCursor({ filter: { category, keyword }, lastDoc: pageParam }),
		initialPageParam: null,
		getNextPageParam: (lastPage: PaginatedItems) => lastPage.lastDoc,
		refetchOnMount: false,
	});
};
