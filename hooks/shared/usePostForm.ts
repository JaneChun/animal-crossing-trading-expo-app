import { PostForm } from '@/types/components';
import { ImageType } from '@/types/image';
import { CartItem, Collection, CommunityType, MarketType } from '@/types/post';
import { useState } from 'react';

export const usePostForm = (
	collectionName: Collection,
): {
	form: PostForm;
	resetForm: () => void;
} => {
	const defaultType = collectionName === 'Boards' ? 'buy' : 'general';

	const [type, setType] = useState<MarketType | CommunityType>(defaultType);
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [images, setImages] = useState<ImageType[]>([]);
	const [cart, setCart] = useState<CartItem[]>([]);
	const [originalImageUrls, setOriginalImageUrls] = useState<string[]>([]); // Firestore에서 가져온 기존 이미지

	const resetForm = () => {
		setType(defaultType);
		setTitle('');
		setBody('');
		setImages([]);
		setCart([]);
		setOriginalImageUrls([]);
	};

	return {
		form: {
			type,
			setType,
			title,
			setTitle,
			body,
			setBody,
			images,
			setImages,
			cart,
			setCart,
			originalImageUrls,
			setOriginalImageUrls,
		},
		resetForm,
	};
};
