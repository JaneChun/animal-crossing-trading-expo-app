import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchUserReviews } from '@/firebase/services/adminService';
import { Paginated, UserReviewDirection } from '@/types/admin';
import { Doc } from '@/types/post';
import { ReviewWithId } from '@/types/review';

export const adminUserReviewsQueryKey = (uid: string, direction: UserReviewDirection) =>
	['adminUserReviews', uid, direction] as const;

export const useUserReviews = (uid: string, direction: UserReviewDirection) => {
	return useInfiniteQuery<
		Paginated<ReviewWithId>,
		Error,
		ReviewWithId[],
		readonly unknown[],
		Doc
	>({
		queryKey: adminUserReviewsQueryKey(uid, direction),
		queryFn: ({ pageParam }) => fetchUserReviews({ uid, direction, lastDoc: pageParam }),
		initialPageParam: null,
		getNextPageParam: (lastPage) => lastPage.lastDoc,
		select: (infiniteData) => infiniteData.pages.flatMap((page) => page.data),
	});
};
