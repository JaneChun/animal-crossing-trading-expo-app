import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchReports } from '@/firebase/services/adminService';
import { Paginated } from '@/types/admin';
import { Doc } from '@/types/post';
import { Report } from '@/types/report';

export const adminReportsQueryKey = (resolved: boolean) => ['adminReports', resolved] as const;

export const useAdminReports = (resolved: boolean) => {
	return useInfiniteQuery<Paginated<Report>, Error, Report[], readonly unknown[], Doc>({
		queryKey: adminReportsQueryKey(resolved),
		queryFn: ({ pageParam }) => fetchReports({ resolved, lastDoc: pageParam }),
		initialPageParam: null,
		getNextPageParam: (lastPage) => lastPage.lastDoc,
		select: (infiniteData) => infiniteData.pages.flatMap((page) => page.data),
	});
};
