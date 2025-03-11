import { Timestamp } from 'firebase/firestore';

export type Type = 'buy' | 'sell' | 'done';

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

export type CreatePostRequest = Omit<Post, 'id'>;

export type UpdatePostRequest = Partial<
	Omit<CreatePostRequest, 'createdAt' | 'creatorId' | 'commentCount'>
>;
