import { Collection } from '@/types/post';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { NewPostFormSchema, NewPostFormValues } from './newPostFormSchema';

export const useNewPostForm = (collectionName: Collection) => {
	const methods = useForm<NewPostFormValues>({
		resolver: zodResolver(NewPostFormSchema),
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
				  },
	});

	return methods;
};
