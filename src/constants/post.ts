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

export const VILLAGER_SPECIES = [
	{ KR: '전체', EN: 'All' },
	{ KR: '고양이', EN: 'Cat' },
	{ KR: '곰', EN: 'Bear' },
	{ KR: '꼬마곰', EN: 'Bear cub' },
	{ KR: '개', EN: 'Dog' },
	{ KR: '개구리', EN: 'Frog' },
	{ KR: '개미핥기', EN: 'Anteater' },
	{ KR: '늑대', EN: 'Wolf' },
	{ KR: '다람쥐', EN: 'Squirrel' },
	{ KR: '닭', EN: 'Chicken' },
	{ KR: '독수리', EN: 'Eagle' },
	{ KR: '돼지', EN: 'Pig' },
	{ KR: '말', EN: 'Horse' },
	{ KR: '문어', EN: 'Octopus' },
	{ KR: '사슴', EN: 'Deer' },
	{ KR: '사자', EN: 'Lion' },
	{ KR: '새', EN: 'Bird' },
	{ KR: '쥐', EN: 'Mouse' },
	{ KR: '악어', EN: 'Alligator' },
	{ KR: '양', EN: 'Sheep' },
	{ KR: '염소', EN: 'Goat' },
	{ KR: '오리', EN: 'Duck' },
	{ KR: '원숭이', EN: 'Monkey' },
	{ KR: '소', EN: 'Cow' },
	{ KR: '코끼리', EN: 'Elephant' },
	{ KR: '코알라', EN: 'Koala' },
	{ KR: '코뿔소', EN: 'Rhinoceros' },
	{ KR: '타조', EN: 'Ostrich' },
	{ KR: '토끼', EN: 'Rabbit' },
	{ KR: '펭귄', EN: 'Penguin' },
	{ KR: '하마', EN: 'Hippo' },
	{ KR: '햄스터', EN: 'Hamster' },
	{ KR: '호랑이', EN: 'Tiger' },
	{ KR: '캥거루', EN: 'Kangaroo' },
	{ KR: '고릴라', EN: 'Gorilla' },
] as const;

export const VILLAGER_PERSONALITIES = [
	{ KR: '먹보', EN: 'Lazy' },
	{ KR: '운동광', EN: 'Jock' },
	{ KR: '무뚝뚝', EN: 'Cranky' },
	{ KR: '느끼함', EN: 'Smug' },
	{ KR: '친절함', EN: 'Normal' },
	{ KR: '아이돌', EN: 'Peppy' },
	{ KR: '성숙함', EN: 'Snooty' },
	{ KR: '단순활발', EN: 'Big sister' },
] as const;

export const MAX_COMMENT_LENGTH = 1000;
export const MAX_IMAGES = 10;
export const MAX_VILLAGERS = 10;
