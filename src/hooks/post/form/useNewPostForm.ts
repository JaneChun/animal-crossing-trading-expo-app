import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Collection } from '@/types/post';

import { NewPostFormSchema, NewPostFormValues } from './newPostFormSchema';

export const useNewPostForm = (collectionName: Collection) => {
	const methods = useForm<NewPostFormValues>({
		resolver: zodResolver(NewPostFormSchema),
		mode: 'onTouched', // onBlur 시에 검증
		reValidateMode: 'onChange', // 에러 난 필드는 onChange 시에 재검증
		defaultValues:
			collectionName === 'Boards'
				? {
						collectionName: 'Boards',
						type: 'buy',
						title: '',
						body: '',
						cart: [],
						images: undefined,
						originalImageUrls: undefined,
					}
				: {
						collectionName: 'Communities',
						type: 'general',
						title: '',
						body: '',
						cart: undefined,
						images: [],
						originalImageUrls: [],
						villagers: [],
					},
	});

	return methods;
};
