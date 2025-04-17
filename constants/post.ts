import { CategoryItem } from '@/types/post';

export const MARKET_TYPES = [
	{ KR: '구해요', EN: 'buy' },
	{ KR: '팔아요', EN: 'sell' },
	{ KR: '거래완료', EN: 'done' },
] as const;

export const COMMUNITY_TYPES = [
	{ KR: '자유', EN: 'general' },
	{ KR: '분양', EN: 'giveaway' },
	{ KR: '입양', EN: 'adopt' },
	{ KR: '공략/팁', EN: 'guide' },
	{ KR: '만지작', EN: 'trade' },
	{ KR: '무 주식', EN: 'turnip' },
	{ KR: '꿈번지', EN: 'dream' },
	{ KR: '마이디자인', EN: 'design' },
] as const;

export const CATEGORIES: CategoryItem[] = [
	{ KR: '전체', EN: 'all' },
	...COMMUNITY_TYPES,
];

// 각 탭(Tab) 별로 연결된 Firestore 컬렉션과 동적 컬렉션 여부를 정의한 config 객체
export const TAB_COLLECTION_CONFIG = {
	Home: { collection: 'Boards', isDynamic: false },
	Community: { collection: 'Communities', isDynamic: false },
	Notice: { collection: 'Boards', isDynamic: true }, // 게시글 내용에 따라 컬렉션 판단
	Chat: { collection: 'Boards', isDynamic: true }, // 게시글 내용에 따라 컬렉션 판단
	Profile: { collection: 'Boards', isDynamic: false },
} as const;
