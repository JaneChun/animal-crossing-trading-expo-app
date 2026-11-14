import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchErrors } from '@/firebase/services/adminService';
import { ErrorLog, Paginated } from '@/types/admin';
import { Doc } from '@/types/post';

export const useAdminErrors = () => {
	return useInfiniteQuery<Paginated<ErrorLog>, Error, ErrorLog[], readonly unknown[], Doc>({
		queryKey: ['adminErrors'],
		queryFn: ({ pageParam }) => fetchErrors(pageParam),
		initialPageParam: null,
		getNextPageParam: (lastPage) => lastPage.lastDoc,
		select: (infiniteData) => infiniteData.pages.flatMap((page) => page.data),
	});
};
