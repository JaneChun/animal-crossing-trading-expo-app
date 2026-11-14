import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchUsers } from '@/firebase/services/adminService';
import { Paginated } from '@/types/admin';
import { Doc } from '@/types/post';
import { UserInfo } from '@/types/user';

export const useAdminUsers = () => {
	return useInfiniteQuery<Paginated<UserInfo>, Error, UserInfo[], readonly unknown[], Doc>({
		queryKey: ['adminUsers'],
		queryFn: ({ pageParam }) => fetchUsers(pageParam),
		initialPageParam: null,
		getNextPageParam: (lastPage) => lastPage.lastDoc,
		select: (infiniteData) => infiniteData.pages.flatMap((page) => page.data),
	});
};
