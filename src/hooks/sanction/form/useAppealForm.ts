import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { AppealFormSchema, AppealFormValues } from './appealFormSchema';

export const useAppealForm = () => {
	return useForm<AppealFormValues>({
		resolver: zodResolver(AppealFormSchema),
		mode: 'onChange',
		defaultValues: { content: '' },
	});
};
