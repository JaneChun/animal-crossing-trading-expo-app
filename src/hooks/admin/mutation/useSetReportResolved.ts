import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '@/components/ui/Toast';
import { setReportResolved } from '@/firebase/services/adminService';

import { adminReportQueryKey } from '../query/useAdminReport';

export const useSetReportResolved = (reportId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (resolved: boolean) => setReportResolved({ reportId, resolved }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminReportQueryKey(reportId) });
			queryClient.invalidateQueries({ queryKey: ['adminReports'] });
			queryClient.invalidateQueries({ queryKey: ['adminUserReports'] });
		},
		onError: () => showToast('error', '처리 상태를 바꾸지 못했습니다.'),
	});
};
