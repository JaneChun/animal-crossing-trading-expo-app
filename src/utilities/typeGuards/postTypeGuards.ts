import { Collection, Post, PostWithCreatorInfo } from '@/types/post';

// Boards 타입 가드 함수
export type BoardPost = PostWithCreatorInfo<'Boards'> | Post<'Boards'>;

export function isBoardPost(
	post: PostWithCreatorInfo<Collection> | Post<Collection>,
	collectionName: Collection,
): post is BoardPost {
	return (
		collectionName === 'Boards' &&
		post !== null &&
		typeof post === 'object' &&
		'cart' in post
	);
}

// Communities 타입 가드 함수
export type CommunityPost =
	| PostWithCreatorInfo<'Communities'>
	| Post<'Communities'>;

export function isCommunityPost(
	post: PostWithCreatorInfo<Collection> | Post<Collection>,
	collectionName: Collection,
): post is CommunityPost {
	return (
		collectionName === 'Communities' &&
		post !== null &&
		typeof post === 'object' &&
		'images' in post
	);
}
