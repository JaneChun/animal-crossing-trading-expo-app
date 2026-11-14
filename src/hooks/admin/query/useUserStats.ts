import { useQuery } from '@tanstack/react-query';

import { fetchUserStats } from '@/firebase/services/adminService';

// 유저 상세에 들어갈 때 그 유저만 계산한다
export const useUserStats = (uid: string) => {
	return useQuery({
		queryKey: ['adminUserStats', uid],
		queryFn: () => fetchUserStats(uid),
		enabled: !!uid,
		staleTime: 0,
	});
};
