import { useQuery } from '@tanstack/react-query';

import { fetchUnresolvedReceivedReports } from '@/firebase/services/adminService';

// 계정 정지 화면의 근거 신고 목록: 유저가 받은 미처리 신고
export const useUnresolvedReceivedReports = (uid: string) => {
	return useQuery({
		queryKey: ['adminUnresolvedReceivedReports', uid],
		queryFn: () => fetchUnresolvedReceivedReports(uid),
		enabled: !!uid,
		staleTime: 0,
	});
};
