import { useQuery } from '@tanstack/react-query';

import { fetchActiveWarningForReport } from '@/firebase/services/adminService';

export const reportWarningQueryKey = (reportId: string) =>
	['adminReportWarning', reportId] as const;

// 이 신고를 근거로 건 유효한 경고. 신고 상세의 [숨김 해제]가 이 경고를 취소한다
export const useReportWarning = (reportId: string) => {
	return useQuery({
		queryKey: reportWarningQueryKey(reportId),
		queryFn: () => fetchActiveWarningForReport(reportId),
		enabled: !!reportId,
		staleTime: 0,
	});
};
