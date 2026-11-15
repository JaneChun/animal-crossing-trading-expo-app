import { useQuery } from '@tanstack/react-query';

import { fetchUnresolvedReportsForTarget } from '@/firebase/services/adminService';
import { Report } from '@/types/report';

export const targetReportsQueryKey = (reportId: string) =>
	['adminTargetReports', reportId] as const;

// 신고 상세의 '근거 신고 N건': 조치를 걸면 함께 처리 완료될 같은 대상의 미처리 신고 (현재 신고 포함)
export const useTargetReports = (report: Report | null | undefined) => {
	return useQuery({
		queryKey: targetReportsQueryKey(report?.id ?? ''),
		queryFn: () => fetchUnresolvedReportsForTarget(report!),
		enabled: !!report && !report.resolved,
		staleTime: 0,
	});
};
