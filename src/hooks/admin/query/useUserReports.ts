import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchUserReports } from '@/firebase/services/adminService';
import { Paginated, UserReportDirection } from '@/types/admin';
import { Doc } from '@/types/post';
import { Report } from '@/types/report';

export const useUserReportsQueryKey = (uid: string, direction: UserReportDirection) =>
	['adminUserReports', uid, direction] as const;

export const useUserReports = (uid: string, direction: UserReportDirection) => {
	return useInfiniteQuery<Paginated<Report>, Error, Report[], readonly unknown[], Doc>({
		queryKey: useUserReportsQueryKey(uid, direction),
		queryFn: ({ pageParam }) => fetchUserReports({ uid, direction, lastDoc: pageParam }),
		initialPageParam: null,
		getNextPageParam: (lastPage) => lastPage.lastDoc,
		select: (infiniteData) => infiniteData.pages.flatMap((page) => page.data),
	});
};
