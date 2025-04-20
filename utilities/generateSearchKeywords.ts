import {
	CartItem,
	Collection,
	CreatePostRequest,
	Post,
	UpdatePostRequest,
} from '@/types/post';

export const generateSearchKeywords = <C extends Collection>({
	collectionName,
	requestData,
}: {
	collectionName: C;
	requestData: CreatePostRequest<C> | UpdatePostRequest<C>;
}) => {
	const keywordSet = new Set<string>();

	if (collectionName === 'Boards') {
		const cartKeywords = extractCartKeywords(requestData.cart);
		cartKeywords.forEach((k) => keywordSet.add(k));
	}

	extractTextKeywords(requestData.title).forEach((k) => keywordSet.add(k));

	return Array.from(keywordSet);
};

const extractCartKeywords = (cart: CartItem[] = []): string[] => {
	const keywords = new Set<string>();

	for (const item of cart) {
		if (!item.name) continue;

		const name = item.name.trim();
		keywords.add(name); // 전체 이름
		keywords.add(name.replace(/\s/g, '')); // 공백 제거

		const words = name.split(' '); // 각 단어
		words.forEach((word) => {
			if (word.length >= 2) keywords.add(word);
		});
	}

	return Array.from(keywords);
};

const extractTextKeywords = (text: string, limit: number = 20): string[] => {
	if (!text) return [];

	const cleaned = text
		.toLowerCase()
		.replace(/[^\w\sㄱ-ㅎ가-힣]/g, '') // 특수문자 제거
		.trim();

	const words = cleaned
		.split(/\s+/) // 공백 기준 나누기
		.filter((word) => word.length >= 2) // 너무 짧은 단어는 제외
		.slice(0, limit); // 개수 제한

	const keywords = new Set<string>();
	for (const word of words) {
		keywords.add(word);
		keywords.add(word.replace(/\s/g, ''));
	}

	return Array.from(keywords);
};

export const pickPostFieldsForSearchKeywords = <C extends Collection>(
	post: Post<C>,
	collectionName: C,
): CreatePostRequest<C> => {
	if (collectionName === 'Boards') {
		const boardPost = post as CreatePostRequest<'Boards'>;
		const { title, body, type, cart } = boardPost;

		return { title, body, type, cart } as CreatePostRequest<C>;
	} else {
		const communityPost = post as CreatePostRequest<'Boards'>;
		const { title, body, type, images } = communityPost;

		return { title, body, type, images } as CreatePostRequest<C>;
	}
};
