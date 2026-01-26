import { searchClient } from '@/config/firebase';
import { Villager, VillagerSpecies } from '@/types/villager';
import { useInfiniteQuery } from '@tanstack/react-query';

const PAGE_SIZE = 30; // 3열 × 10행

interface VillagerFilter {
	species?: VillagerSpecies;
	keyword?: string;
}

const searchVillagersByCursor = async ({
	filter,
	pageParam = 0,
}: {
	filter: VillagerFilter;
	pageParam: number;
}): Promise<Villager[]> => {
	const { species = '', keyword = '' } = filter;

	const { results } = await searchClient.searchForHits<Villager>({
		requests: [
			{
				indexName: 'Villagers',
				query: keyword,
				page: pageParam, // 시작 페이지 번호
				hitsPerPage: PAGE_SIZE,
				...(species && species !== 'All' ? { filters: `species:${species}` } : {}),
			},
		],
	});

	return results[0].hits.map((hit) => ({
		...hit,
		id: hit.objectID,
	}));
};

export const useSearchVillagers = (species?: VillagerSpecies, keyword?: string) => {
	return useInfiniteQuery<
		Villager[],
		Error,
		Villager[],
		[string, VillagerSpecies | undefined, string | undefined]
	>({
		queryKey: ['villagers', species, keyword],
		queryFn: ({ pageParam }) =>
			searchVillagersByCursor({
				filter: { species, keyword },
				pageParam: pageParam as number,
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) =>
			lastPage.length === PAGE_SIZE ? allPages.length : undefined,
		select: (data) => data.pages.flat(),
	});
};
