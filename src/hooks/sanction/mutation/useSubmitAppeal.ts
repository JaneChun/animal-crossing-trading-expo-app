import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '@/components/ui/Toast';
import { submitAppeal } from '@/firebase/services/sanctionService';

import { mySanctionsQueryKey } from '../query/useMySanctions';

export const useSubmitAppeal = (uid: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: submitAppeal,
		// 한 번만 접수되는 요청이라 재시도하면 이미 접수된 신청이 '이미 신청함'으로 실패한다
		retry: false,
		// 실패(이미 신청함, 기한 지남)해도 목록을 새로 받아 [이의 신청] 버튼 노출을 서버 상태에 맞춘다
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: mySanctionsQueryKey(uid) });
		},
		onError: () => showToast('error', '처리하지 못했습니다. 다시 시도해 주세요.'),
	});
};
