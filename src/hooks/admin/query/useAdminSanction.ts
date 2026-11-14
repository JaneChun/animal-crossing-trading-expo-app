import { useQuery } from '@tanstack/react-query';

import { fetchReportsByIds, fetchSanction } from '@/firebase/services/adminService';

export const adminSanctionQueryKey = (sanctionId: string) => ['adminSanction', sanctionId] as const;

export const useAdminSanction = (sanctionId: string) => {
	return useQuery({
		queryKey: adminSanctionQueryKey(sanctionId),
		queryFn: () => fetchSanction(sanctionId),
		enabled: !!sanctionId,
		staleTime: 0,
	});
};

// 조치의 근거 신고 목록
export const useSanctionReports = (sanctionId: string, reportIds: string[] | undefined) => {
	return useQuery({
		queryKey: ['adminSanctionReports', sanctionId],
		queryFn: () => fetchReportsByIds(reportIds ?? []),
		enabled: !!reportIds?.length,
	});
};
