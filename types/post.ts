import {
	COMMUNITY_TYPES,
	CURRENCY_OPTIONS,
	ITEM_CATEGORIES,
	MARKET_TYPES,
	TAB_COLLECTION_CONFIG,
} from '@/constants/post';
import {
	DocumentData,
	QueryDocumentSnapshot,
	Timestamp,
} from 'firebase/firestore';

export type Collection = 'Boards' | 'Communities';

// 탭 이름을 나타내는 유니언 타입 ('Home' | 'Community' | ...)
export type Tab = keyof typeof TAB_COLLECTION_CONFIG;

// 특정 탭(Tab)에서 사용할 컬렉션 이름 타입을 유추하는 조건부 타입 (CollectionFromTab<'Home'> → 'Boards')
export type CollectionFromTab<T extends Tab> =
	(typeof TAB_COLLECTION_CONFIG)[T]['collection'];

// 마켓글 타입
export type MarketTypeItem = (typeof MARKET_TYPES)[number];
export type MarketType = (typeof MARKET_TYPES)[number]['EN'];

// 커뮤니티 게시글 타입
export type CommunityTypeItem = (typeof COMMUNITY_TYPES)[number];
export type CommunityType = (typeof COMMUNITY_TYPES)[number]['EN'];

// 커뮤니티탭 카테고리
export type CategoryItem = CommunityTypeItem | { KR: '전체'; EN: 'all' };
export type Category = CommunityType | 'all';

// 아이템 카테고리
export type ItemCategoryItem = (typeof ITEM_CATEGORIES)[number];
export type ItemCategory = (typeof ITEM_CATEGORIES)[number]['EN'];

// 거래 화폐 단위
export type CurrencyOptionItem = (typeof CURRENCY_OPTIONS)[number];
export type CurrencyOption = (typeof CURRENCY_OPTIONS)[number]['EN'];

// 공통 필드
export interface CommonPostFields {
	id: string;
	title: string;
	body: string;
	creatorId: string;
	createdAt: Timestamp;
	commentCount: number;
}

// 단독 필드
type MarketOnlyFields = {
	type: MarketType;
	cart: CartItem[];
	chatRoomIds: string[];
};
type CommunityOnlyFields = {
	type: CommunityType;
	images: string[];
};

// 게시글 타입
type MarketPost = CommonPostFields & MarketOnlyFields;
type CommunityPost = CommonPostFields & CommunityOnlyFields;

// 컬렉션 기반으로 게시글 타입 분기
export type Post<C extends Collection> = C extends 'Boards'
	? MarketPost
	: C extends 'Communities'
	? CommunityPost
	: never;

export type PostWithCreatorInfo<C extends Collection> = Post<C> & CreatorInfo;

// Firestore용 PostDoc
export type PostDoc<C extends Collection> = Post<C> & {
	isDeleted: boolean;
	updatedAt?: Timestamp;
};

export interface CreatorInfo {
	creatorDisplayName: string;
	creatorIslandName: string;
	creatorPhotoURL: string;
}

export interface Item {
	id: string;
	category: string;
	color?: string;
	imageUrl: string;
	name: string;
}

export interface CartItem extends Item {
	quantity: number;
	price: number;
	unit: CurrencyOption;
}

// firebase/services/postService.ts
type CommonRequestFields<C extends Collection> = C extends 'Boards'
	? {
			type: MarketType;
			title: string;
			body: string;
			cart: CartItem[];
			images?: never; // 금지
	  }
	: {
			type: CommunityType;
			title: string;
			body: string;
			images: string[];
			cart?: never; // 금지
	  };

export type CreatePostRequest<C extends Collection> = CommonRequestFields<C>;

// 모든 필드를 선택적으로 받음
export type UpdatePostRequest<C extends Collection> = Partial<
	Omit<CommonRequestFields<C>, 'creatorId'>
>;

// hooks/query/useInfinitePosts.ts
export type Doc = QueryDocumentSnapshot<DocumentData> | null;

export type Filter = {
	creatorId?: string;
	category?: string;
};

export interface FirestoreQueryParams {
	collectionName: Collection;
	filter?: Filter;
	lastDoc?: Doc;
}

export interface PaginatedPosts<C extends Collection> {
	data: PostWithCreatorInfo<C>[];
	lastDoc: Doc;
}

// hooks/shared/usePostSubmit.ts
export type usePostSubmitParams<C extends Collection> = {
	collectionName: C;
	resetAll: () => void;
	createPost: (
		data: { requestData: CreatePostRequest<C>; userId: string },
		options: { onSuccess: (id: string) => void; onError: () => void },
	) => void;
	updatePost: (
		data: UpdatePostRequest<C>,
		options: { onSuccess: () => void; onError: () => void },
	) => void;
};

export type buildCreatePostRequestParams<C extends Collection> = {
	collectionName: C;
	imageUrls: string[];
	form: CreatePostRequest<C>;
};

export type buildUpdatePostRequestParams<C extends Collection> = {
	collectionName: C;
	imageUrls: string[];
	form: UpdatePostRequest<C>;
};

export type createPostFlowParams<C extends Collection> = {
	imageUrls: string[];
	form: CreatePostRequest<C>;
	userId: string;
};

export type updatePostFlowParams<C extends Collection> = {
	imageUrls: string[];
	form: UpdatePostRequest<C>;
};
