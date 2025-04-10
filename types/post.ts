import {
	DocumentData,
	QueryDocumentSnapshot,
	Timestamp,
} from 'firebase/firestore';
import { Collection } from './components';

export type MarketType = 'buy' | 'sell' | 'done';
export type CommunityType =
	| 'all'
	| 'general'
	| 'giveaway'
	| 'adopt'
	| 'guide'
	| 'trade'
	| 'turnip'
	| 'dream'
	| 'design';

export type Type = MarketType | CommunityType;

export interface Post {
	id: string;
	type: Type;
	title: string;
	body: string;
	images?: string[];
	cart?: CartItem[];
	creatorId: string;
	createdAt: Timestamp;
	commentCount: number;
}

export interface CreatorInfo {
	creatorDisplayName: string;
	creatorIslandName: string;
	creatorPhotoURL: string;
}

export interface Item {
	UniqueEntryID: string;
	color: string;
	imageUrl: string;
	name: string;
}

export interface CartItem extends Item {
	quantity: number;
	price: number;
}

export interface PostWithCreatorInfo extends Post, CreatorInfo {}

// firebase/services/postService.ts
export type CreatePostRequest = Omit<Post, 'id'>;

export type UpdatePostRequest = Partial<
	Omit<CreatePostRequest, 'createdAt' | 'creatorId' | 'commentCount'>
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

export interface PaginatedPosts {
	data: PostWithCreatorInfo[];
	lastDoc: Doc;
}
