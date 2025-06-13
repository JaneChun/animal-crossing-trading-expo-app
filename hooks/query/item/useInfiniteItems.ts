import { searchClient } from '@/fbase';
import { Item, ItemCategory } from '@/types/post';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

const PAGE_SIZE = 20;

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
}): Promise<Item[]> => {
	const { category = '', keyword = '' } = filter;

	const { results } = await searchClient.search({
		requests: [
			{
				indexName: 'Items',
				query: keyword,
				page: pageParam, // 시작 페이지 번호
				hitsPerPage: PAGE_SIZE,
				...(category === 'All' ? {} : { filters: `category:${category}` }),
			},
		],
	});

	return results[0].hits.map((hit) => ({
		id: hit.objectID,
		...hit,
	}));
};

export const useInfiniteItems = (category?: ItemCategory, keyword?: string) => {
	return useInfiniteQuery<
		Item[],
		Error,
		InfiniteData<Item[]>,
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
	});
};
