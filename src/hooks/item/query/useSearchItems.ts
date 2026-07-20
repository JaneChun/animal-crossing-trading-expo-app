import { useInfiniteQuery } from '@tanstack/react-query';

import { searchClient } from '@/config/firebase';
import { CatalogItem } from '@/types/catalog';
import { ItemCategory } from '@/types/post';

const PAGE_SIZE = 30;

interface ItemFilter {
	category?: ItemCategory;
	keyword?: string;
}

const searchItemsByCursor = async ({
	filter,
	pageParam = 0,
}: {
	filter: ItemFilter;
	pageParam: number;
}): Promise<CatalogItem[]> => {
	const { category = '', keyword = '' } = filter;

	const { results } = await searchClient.searchForHits<CatalogItem>({
		requests: [
			{
				indexName: 'CatalogItems',
				query: keyword,
				page: pageParam, // 시작 페이지 번호
				hitsPerPage: PAGE_SIZE,
				...(category === 'All' ? {} : { filters: `category:${category}` }),
				// 이름 완전 일치 아이템을 최상단으로 부스트 (name이 searchable facet으로 등록되어 있어야 함)
				...(keyword ? { optionalFilters: [`name:${keyword}`] } : {}),
			},
		],
	});

	return results[0].hits.map((hit) => ({
		...hit,
		id: hit.objectID,
	}));
};

export const useSearchItems = (category?: ItemCategory, keyword?: string) => {
	return useInfiniteQuery<
		CatalogItem[],
		Error,
		CatalogItem[],
		[string, ItemCategory | undefined, string | undefined]
	>({
		queryKey: ['items', category, keyword],
		queryFn: ({ pageParam }) =>
			searchItemsByCursor({
				filter: { category, keyword },
				pageParam: pageParam as number,
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) =>
			lastPage.length === PAGE_SIZE ? allPages.length : undefined,
		select: (data) => data.pages.flat(),
	});
};
