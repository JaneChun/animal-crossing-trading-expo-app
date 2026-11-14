import { useQuery } from '@tanstack/react-query';

import { fetchSanctionRecommendation } from '@/firebase/services/adminService';

// 정지 바텀시트를 열 때만 계산한다
export const useSanctionRecommendation = (uid: string, enabled: boolean) => {
	return useQuery({
		queryKey: ['adminSanctionRecommendation', uid],
		queryFn: () => fetchSanctionRecommendation(uid),
		enabled: !!uid && enabled,
		staleTime: 0,
	});
};
