import { useQuery } from '@tanstack/react-query';

import { fetchReport, fetchReportTargetContent } from '@/firebase/services/adminService';
import { Report } from '@/types/report';

export const adminReportQueryKey = (reportId: string) => ['adminReport', reportId] as const;
export const adminReportTargetQueryKey = (reportId: string) =>
	['adminReportTarget', reportId] as const;

export const useAdminReport = (reportId: string) => {
	return useQuery({
		queryKey: adminReportQueryKey(reportId),
		queryFn: () => fetchReport(reportId),
		enabled: !!reportId,
		staleTime: 0,
	});
};

// 신고 대상 게시글·댓글의 현재 상태 (숨김·삭제 여부 확인용)
export const useReportTargetContent = (report: Report | null | undefined) => {
	return useQuery({
		queryKey: adminReportTargetQueryKey(report?.id ?? ''),
		queryFn: () => fetchReportTargetContent(report!),
		enabled: !!report?.postId,
		staleTime: 0,
	});
};
