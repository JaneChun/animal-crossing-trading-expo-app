import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { AndroidTesterFormSchema, AndroidTesterFormValues } from './androidTesterFormSchema';

export const useAndroidTesterForm = () => {
	return useForm<AndroidTesterFormValues>({
		resolver: zodResolver(AndroidTesterFormSchema),
		mode: 'onTouched', // onBlur 시에 검증
		reValidateMode: 'onChange', // 에러 난 필드는 onChange 시에 재검증
		defaultValues: { email: '', agreed: false },
	});
};
