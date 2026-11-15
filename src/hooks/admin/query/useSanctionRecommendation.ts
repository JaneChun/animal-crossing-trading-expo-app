import { useQuery } from '@tanstack/react-query';

import { fetchSanctionRecommendation } from '@/firebase/services/adminService';

// 계정 정지 화면에서만 계산한다
export const useSanctionRecommendation = (uid: string, enabled: boolean) => {
	return useQuery({
		queryKey: ['adminSanctionRecommendation', uid],
		queryFn: () => fetchSanctionRecommendation(uid),
		enabled: !!uid && enabled,
		staleTime: 0,
	});
};
