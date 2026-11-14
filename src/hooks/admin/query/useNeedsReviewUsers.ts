import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchNeedsReviewUsers } from '@/firebase/services/adminService';
import { Paginated } from '@/types/admin';
import { Doc } from '@/types/post';
import { UserInfo } from '@/types/user';

export const useNeedsReviewUsers = () => {
	return useInfiniteQuery<Paginated<UserInfo>, Error, UserInfo[], readonly unknown[], Doc>({
		queryKey: ['adminNeedsReviewUsers'],
		queryFn: ({ pageParam }) => fetchNeedsReviewUsers(pageParam),
		initialPageParam: null,
		getNextPageParam: (lastPage) => lastPage.lastDoc,
		select: (infiniteData) => infiniteData.pages.flatMap((page) => page.data),
	});
};
