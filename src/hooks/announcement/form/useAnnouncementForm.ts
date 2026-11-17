import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { AnnouncementFormSchema, AnnouncementFormValues } from './announcementFormSchema';

export const useAnnouncementForm = () => {
	return useForm<AnnouncementFormValues>({
		resolver: zodResolver(AnnouncementFormSchema),
		mode: 'onTouched', // onBlur 시에 검증
		reValidateMode: 'onChange', // 에러 난 필드는 onChange 시에 재검증
		defaultValues: { title: '', body: '', hidden: false },
	});
};
