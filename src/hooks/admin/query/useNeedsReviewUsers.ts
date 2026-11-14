import { useQuery } from '@tanstack/react-query';

import { fetchNeedsReviewUsers } from '@/firebase/services/adminService';

export const useNeedsReviewUsers = () => {
	return useQuery({
		queryKey: ['adminNeedsReviewUsers'],
		queryFn: fetchNeedsReviewUsers,
		staleTime: 0,
	});
};
