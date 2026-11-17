import { useMutation } from '@tanstack/react-query';

import { showToast } from '@/components/ui/Toast';
import { isFirebaseError } from '@/firebase/core/types';
import { submitAndroidTesterEmail } from '@/firebase/services/androidTesterService';

// 이미 신청한 이메일이면 규칙상 생성이 아닌 수정으로 판정돼 permission-denied가 난다.
// 신청은 이미 되어 있으므로 성공과 같이 처리한다
const submitIgnoringDuplicate = async (email: string) => {
	try {
		await submitAndroidTesterEmail(email);
	} catch (error) {
		const isDuplicate = isFirebaseError(error) && error.code === 'permission-denied';
		if (!isDuplicate) throw error;
	}
};

export const useSubmitAndroidTesterEmail = () => {
	return useMutation({
		mutationFn: submitIgnoringDuplicate,
		onSuccess: () => showToast('success', '테스터 신청이 완료되었습니다.'),
		onError: () => showToast('error', '테스터 신청 중 오류가 발생했습니다.'),
	});
};
