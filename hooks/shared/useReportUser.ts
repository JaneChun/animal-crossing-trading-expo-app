import { showToast } from '@/components/ui/Toast';
import { createReport } from '@/firebase/services/reportService';
import { useAuthStore } from '@/stores/AuthStore';
import { ReportUserParams } from '@/types/components';
import { CreateReportRequest, ReportTarget } from '@/types/report';
import { navigateToLogin } from '@/utilities/navigationHelpers';
import { useCallback, useState } from 'react';

export const useReportUser = () => {
	const userInfo = useAuthStore((state) => state.userInfo);
	const [isReportModalVisible, setReportModalVisible] = useState(false);
	const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);

	const openReportModal = useCallback((target: ReportTarget) => {
		setReportTarget(target);
		setReportModalVisible(true);
	}, []);

	const closeReportModal = useCallback(() => {
		setReportTarget(null);
		setReportModalVisible(false);
	}, []);

	const submitReport = useCallback(
		async ({ category, detail = '' }: ReportUserParams) => {
			if (!userInfo) {
				showToast('warn', '신고는 로그인 후 가능합니다.');
				navigateToLogin();
				return;
			}

			if (!reportTarget) {
				showToast('error', '신고 대상을 찾을 수 없습니다.');
				return;
			}

			if (reportTarget.reporteeId === userInfo.uid) {
				showToast('error', '본인을 신고할 수 없습니다.');
				return;
			}
			try {
				const payload: CreateReportRequest = {
					reporterId: userInfo.uid,
					reporteeId: reportTarget.reporteeId,
					// postId, commentId, chatId 중 정의된 것만 전송
					...(reportTarget.postId && { postId: reportTarget.postId }),
					...(reportTarget.commentId && { commentId: reportTarget.commentId }),
					...(reportTarget.chatId && { chatId: reportTarget.chatId }),
					category,
					detail,
				};

				await createReport(payload);
				showToast('success', '신고가 접수되었습니다.');
			} catch (e) {
				console.error(e);
				showToast('error', '신고 제출 중 오류가 발생했습니다.');
			} finally {
				closeReportModal();
			}
		},
		[userInfo, reportTarget, closeReportModal],
	);

	return {
		isReportModalVisible,
		reportTarget,
		openReportModal,
		closeReportModal,
		submitReport,
	};
};
