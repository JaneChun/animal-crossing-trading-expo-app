import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FeedbackFormSchema, FeedbackFormValues } from './feedbackFormSchema';

export const useFeedbackForm = () => {
	return useForm<FeedbackFormValues>({
		resolver: zodResolver(FeedbackFormSchema),
		mode: 'onTouched', // onBlur 시에 검증
		reValidateMode: 'onChange', // 에러 난 필드는 onChange 시에 재검증
		defaultValues: { body: '' },
	});
};
