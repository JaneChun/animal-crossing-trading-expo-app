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
	{ KR: '알바', EN: 'parttime' },
] as const;

export const CATEGORIES: CategoryItem[] = [{ KR: '전체', EN: 'all' }, ...COMMUNITY_TYPES];

export const CURRENCY_OPTIONS = [
	{ KR: '마일 티켓', EN: 'mileticket' },
	{ KR: '덩', EN: 'bell' },
] as const;

// 각 탭(Tab) 별로 연결된 Firestore 컬렉션을 정의한 config 객체
export const TAB_COLLECTION_CONFIG = {
	Home: { collection: 'Boards' },
	Community: { collection: 'Communities' },
	Notice: { collection: 'Boards' },
	Chat: { collection: 'Boards' },
	Profile: { collection: 'Boards' },
} as const;

export const ITEM_CATEGORIES = [
	{ KR: '전체', EN: 'All' },
	{ KR: '가구', EN: 'Houswares' },
	{ KR: '잡화', EN: 'Miscellaneous' },
	{ KR: '벽걸이', EN: 'Wallmounted' },
	{ KR: '레시피', EN: 'Recipes' },
	// { KR: '요리', EN: 'Food' },
	{ KR: '모자', EN: 'Headwear' },
	{ KR: '상의', EN: 'Tops' },
	{ KR: '하의', EN: 'Bottoms' },
	{ KR: '원피스', EN: 'DressUp' },
	{ KR: '양말', EN: 'Socks' },
	{ KR: '가방', EN: 'Bags' },
	{ KR: '신발', EN: 'Shoes' },
	{ KR: '악세사리', EN: 'Accessories' },
	{ KR: '우산', EN: 'Umbrellas' },
	{ KR: '천장', EN: 'CeilingDecor' },
	{ KR: '벽지', EN: 'Wallpaper' },
	{ KR: '바닥', EN: 'Floors' },
	{ KR: '러그', EN: 'Rugs' },
	{ KR: '음악', EN: 'Music' },
	{ KR: '토용', EN: 'Gyriods' },
	{ KR: '사진', EN: 'Photos' },
	{ KR: '포스터', EN: 'Posters' },
	{ KR: '도구', EN: 'Tools' },
	{ KR: '울타리', EN: 'Fencing' },
	{ KR: '잠수복', EN: 'WetSuit' },
	{ KR: '곤충', EN: 'Insects' },
	{ KR: '물고기', EN: 'Fish' },
	{ KR: '바다 생물', EN: 'SeaCreatures' },
	{ KR: '화석', EN: 'Fossils' },
	{ KR: '미술품', EN: 'Artwork' },
	{ KR: '기타', EN: 'Other' },
] as const;

export const REPORT_CATEGORIES = [
	{ KR: '사기', EN: 'fraud' },
	{ KR: '욕설/비방', EN: 'abuse' },
	{ KR: '광고/도배', EN: 'spam' },
	{ KR: '음란/부적절 콘텐츠', EN: 'inappropriate' },
	{ KR: '기타', EN: 'other' },
];

export const MAX_COMMENT_LENGTH = 1000;
export const MAX_IMAGES = 10;
