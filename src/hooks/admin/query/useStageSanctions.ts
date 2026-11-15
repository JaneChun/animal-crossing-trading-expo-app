import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchStageSanctions } from '@/firebase/services/adminService';
import { Paginated } from '@/types/admin';
import { Doc } from '@/types/post';
import { Sanction, SanctionReviewStage } from '@/types/sanction';

export const stageSanctionsQueryKey = (stage: SanctionReviewStage) =>
	['adminStageSanctions', stage] as const;

export const useStageSanctions = (stage: SanctionReviewStage) => {
	return useInfiniteQuery<Paginated<Sanction>, Error, Sanction[], readonly unknown[], Doc>({
		queryKey: stageSanctionsQueryKey(stage),
		queryFn: ({ pageParam }) => fetchStageSanctions({ stage, lastDoc: pageParam }),
		initialPageParam: null,
		getNextPageParam: (lastPage) => lastPage.lastDoc,
		select: (infiniteData) => infiniteData.pages.flatMap((page) => page.data),
	});
};
