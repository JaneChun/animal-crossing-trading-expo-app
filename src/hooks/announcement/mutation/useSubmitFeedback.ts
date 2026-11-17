import { useMutation } from '@tanstack/react-query';

import { showToast } from '@/components/ui/Toast';
import { submitFeedback } from '@/firebase/services/feedbackService';
import { useUserInfo } from '@/stores/auth';

export const useSubmitFeedback = () => {
	const userInfo = useUserInfo();

	return useMutation({
		mutationFn: (body: string) => {
			// 시트는 로그인 상태에서만 열린다. 연 채로 로그아웃하면 오류 토스트로 끝난다
			if (!userInfo) throw new Error('로그인이 필요합니다.');
			return submitFeedback({ uid: userInfo.uid, body });
		},
		onSuccess: () => showToast('success', '의견을 보냈습니다. 감사합니다!'),
		onError: () => showToast('error', '의견 전송 중 오류가 발생했습니다.'),
	});
};
