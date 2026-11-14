import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchUserBlocks } from '@/firebase/services/adminService';
import { AdminBlockRecord, Paginated, UserBlockDirection } from '@/types/admin';
import { Doc } from '@/types/post';

export const adminUserBlocksQueryKey = (uid: string, direction: UserBlockDirection) =>
	['adminUserBlocks', uid, direction] as const;

export const useUserBlocks = (uid: string, direction: UserBlockDirection) => {
	return useInfiniteQuery<
		Paginated<AdminBlockRecord>,
		Error,
		AdminBlockRecord[],
		readonly unknown[],
		Doc
	>({
		queryKey: adminUserBlocksQueryKey(uid, direction),
		queryFn: ({ pageParam }) => fetchUserBlocks({ uid, direction, lastDoc: pageParam }),
		initialPageParam: null,
		getNextPageParam: (lastPage) => lastPage.lastDoc,
		select: (infiniteData) => infiniteData.pages.flatMap((page) => page.data),
	});
};
