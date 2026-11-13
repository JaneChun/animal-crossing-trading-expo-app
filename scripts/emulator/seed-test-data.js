/**
 * 에뮬레이터 시드 진입점 — npm run emulator:seed
 * 에뮬레이터 Auth·Firestore·Storage를 모두 비운 뒤 이미지 → 카탈로그 → 주민 → 테스트 데이터 순서로 넣는다.
 * firebase-admin-setup.js가 에뮬레이터 호스트를 강제로 설정하므로 운영 DB에는 연결되지 않는다.
 */
const {
	disableBackgroundTriggers,
	enableBackgroundTriggers,
	resetEmulator,
} = require('./emulator-control');
const { seedCatalog } = require('./seed-catalog');
const { uploadSeedImages } = require('./seed-images');
const { seedVillagers } = require('./seed-villagers');
const { auth, db } = require('../../src/__tests__/firebase-utils/firebase-admin-setup');

// ─── 시간 ─────────────────────────────────────────────────────────────────────

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// 실행 시각 기준 상대 시간 — 언제 시드해도 목록이 최신순으로 자연스럽게 보이도록
const ago = (ms) => new Date(Date.now() - ms);

// ─── 유저 ID ──────────────────────────────────────────────────────────────────

// 1번 유저 자리는 .env.local의 SEED_MY_UID로 바꿀 수 있다 (본인 계정으로 시드 데이터 보기)
const DEFAULT_USER_1_UID = '001827.95fec4cf29524bfbb08744e92ef6050a.0427';
const USER_1 = process.env.SEED_MY_UID || DEFAULT_USER_1_UID;
const USER_2 = 'u_s_e_r_2';
const USER_3 = 'user3';

// src/firebase/services/chatService.ts의 generateChatId와 같은 규칙
const generateChatId = (user1, user2) => [user1, user2].sort().join('_');

const CHAT_1_2 = generateChatId(USER_1, USER_2);
const CHAT_1_3 = generateChatId(USER_1, USER_3);
const CHAT_2_3 = generateChatId(USER_2, USER_3);

// ─── 카트 아이템 ──────────────────────────────────────────────────────────────

// functions/scripts/output/catalog.json의 실제 아이템 값.
// catalogItemToItem / catalogVariantToItem(src/utilities/catalogItemToItem.ts)이 만드는 형태와 같다.
// 카탈로그 시드가 없어도 게시글 표시가 깨지지 않도록 값을 직접 적는다.
const ITEMS = {
	sakuraLantern: {
		id: 'JdhjW3iq3t4P54BFe',
		category: 'Housewares',
		color: '다크 우드',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/FtrSakuraLantern_Remake_0_0.png',
		name: '벚꽃 초롱',
	},
	sakuraClock: {
		id: 'tb9y9v6vrf98WExq7',
		category: 'Wallmounted',
		color: '핑크',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/FtrSakuraClockW_Remake_0_0.png',
		name: '벚꽃 시계',
	},
	featherPhoto: {
		id: 'gZauKXpNyAnJkzQ3D',
		category: 'Photos',
		color: '내추럴 우드',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/BromideNpcNmlBrd09_Remake_0_0.png',
		name: '페더의 사진',
	},
	goldShovelRecipe: {
		id: 'aEtPEYkwgj9BJ48Et',
		category: 'Recipes',
		color: '레시피',
		imageUrl: 'https://nh-cdn.catalogue.ac/DIYRecipeIcon/ToolScoopGold.png',
		name: '금 삽',
	},
	goldWateringCan: {
		id: 'bzEwTDjTeK4gKSsZa',
		category: 'Tools',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/ToolWateringGold.png',
		name: '금 물뿌리개',
	},
	grandPiano: {
		id: 'YQ8uP3So3xErPJ2u4',
		category: 'Housewares',
		color: '블랙',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/FtrPianoGrand_Remake_0_0.png',
		name: '그랜드 피아노',
	},
	pianoChair: {
		id: 'TKqHoeYMsW9irSWYk',
		category: 'Housewares',
		color: '블랙',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/FtrPianochair_Remake_0_0.png',
		name: '피아노 의자',
	},
	starFragment: {
		id: 'Fy2vYDWHtktFPiRjz',
		category: 'Other',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/Starpiece.png',
		name: '별의 조각',
	},
	largeStarFragment: {
		id: 'FA6nhbrBzK7ESdoDL',
		category: 'Other',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/StarpieceRare.png',
		name: '커다란 별의 조각',
	},
	logBed: {
		id: 'Wg9uF8DBwAYuXe2bP',
		category: 'Housewares',
		color: '다크 우드, 킬림',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/FtrLogBedW_Remake_0_0.png',
		name: '통나무 침대',
	},
	crown: {
		id: 's8RSxedxt7JkFnGCw',
		category: 'Headwears',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/CapHatCrownRed.png',
		name: '왕관',
	},
	boxSofa: {
		id: 'pu6EP3DibieFgjoik',
		category: 'Housewares',
		color: '에메랄드',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/FtrBoxsofa_Remake_0_0.png',
		name: '사각 소파',
	},
	parasolBed: {
		id: 'A9mdF3umjmiAQxLFX',
		category: 'Housewares',
		color: '화이트, 블루×화이트',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/FtrBeachparasol_Remake_0_0.png',
		name: '파라솔 선베드',
	},
	arch2021: {
		id: 'kzegJttZt8DzxwamN',
		category: 'Housewares',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/Ftr2021Arch.png',
		name: '2021년 아치',
	},
	astronaut: {
		id: 'mBhzWedMXNB5HSrKa',
		category: 'Housewares',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/FtrSpacesuit.png',
		name: '우주 비행사',
	},
	xmasTree: {
		id: 'Map2ykX5ezxwnyEDr',
		category: 'Housewares',
		color: '컬러풀',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/FtrTreeXmasL_Remake_0_0.png',
		name: '큰 크리스마스트리',
	},
	snowman: {
		id: 'ctnJAyfZZ39QEnK5G',
		category: 'Housewares',
		color: '블루',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/FtrSnowman_Remake_0_0.png',
		name: '3단 눈사람',
	},
	goldAltar: {
		id: 'F4Xz5nt5LuyWyoEbt',
		category: 'Housewares',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/FtrGoldAltar.png',
		name: '황금 제단',
	},
	bambooBasket: {
		id: 'EhqChmN8mmQb5Xbrs',
		category: 'Housewares',
		color: '푸른 대나무',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/FtrBambooBasket_Remake_0_0.png',
		name: '대나무 바구니',
	},
	bellRug: {
		id: 'KfRapmYKpizqQWzCg',
		category: 'Rugs',
		imageUrl: 'https://nh-cdn.catalogue.ac/FtrIcon/RugOtherBellM00.png',
		name: '벨 주머니 러그',
	},
};

const toCartItem = (item, quantity, price, unit) => ({ ...item, quantity, price, unit });

// ─── 주민 ID ──────────────────────────────────────────────────────────────────

// 운영 Villagers 문서 ID(= Algolia Villagers 인덱스 objectID). seed-villagers.js가 같은 ID로 저장한다.
const VILLAGERS = {
	jjuni: 'l0C3N8sEjk9f5bVzqdHf', // 쭈니
	jackson: 'kDOWTsAXaNZyc2DL2HjT', // 잭슨
	himdeureo: 'a5GusDEqyRzz5mV9haxO', // 힘드러
	miae: 'uWbBlJSAABCgNGjLnm2I', // 미애
};

// ─── 목록 스크롤용 추가 게시글 ────────────────────────────────────────────────

// 채팅·리뷰가 참조하지 않는 게시글. 작성자는 1→2→3번 유저 순으로 돌아가며,
// 작성 시각은 손으로 쓴 게시글(최근 3일)보다 조금씩 이전으로 퍼뜨린다.
const EXTRA_BOARD_DRAFTS = [
	{
		type: 'buy',
		title:
			'[급구] 벚꽃 시즌 한정 가구 전부 구합니다 벚꽃 초롱, 벚꽃 시계 말고도 벚꽃 관련 가구 있으신 분들 연락 주세요 마일 넉넉하게 드려요',
		body: '제목 그대로입니다. 벚꽃 가구 세트 맞추는 중이에요. 하나만 있어도 괜찮으니 편하게 연락 주세요!',
		cart: [
			['sakuraLantern', 2, 3, 'mileticket'],
			['sakuraClock', 1, 2, 'mileticket'],
		],
	},
	{
		type: 'sell',
		title: '통나무 침대 팔아요',
		body: '리폼한 통나무 침대 팝니다.',
		cart: [['logBed', 1, 4, 'bell']],
	},
	{
		type: 'sell',
		title: '왕관 판매 (한정 수량)',
		body: '왕관 두 개 있어요. 선착순!',
		cart: [['crown', 2, 15, 'mileticket']],
	},
	{
		type: 'buy',
		title: '사각 소파 에메랄드 색 구해요',
		body: '거실 꾸미는 중이에요.',
		cart: [['boxSofa', 2, 3, 'bell']],
	},
	{
		type: 'sell',
		title: '여름 해변 세트 정리합니다',
		body: '파라솔 선베드랑 대나무 바구니 같이 팔아요. 따로도 가능합니다.',
		cart: [
			['parasolBed', 2, 2, 'bell'],
			['bambooBasket', 3, 1, 'bell'],
		],
	},
	{
		type: 'done',
		title: '2021년 아치 거래완료',
		body: '좋은 분께 보냈습니다.',
		cart: [['arch2021', 1, 5, 'mileticket']],
	},
	{
		type: 'buy',
		title: '우주 비행사 있으신 분?',
		body: '우주 테마 섬 만들고 있어요!',
		cart: [['astronaut', 1, 20, 'bell']],
	},
	{
		type: 'sell',
		title: '크리스마스 가구 미리 팔아요',
		body: '큰 크리스마스트리, 3단 눈사람 있어요. 겨울 준비하세요~',
		cart: [
			['xmasTree', 1, 6, 'bell'],
			['snowman', 2, 3, 'bell'],
		],
	},
	{
		type: 'sell',
		title: '황금 제단 팝니다',
		body: '흔하지 않은 가구예요. 가격 제안 받아요.',
		cart: [['goldAltar', 1, 50, 'bell']],
	},
	{
		type: 'buy',
		title: '벨 주머니 러그 구해요',
		body: '부자 느낌 나는 방 꾸미고 싶어요 ㅎㅎ',
		cart: [['bellRug', 1, 2, 'mileticket']],
	},
	{
		type: 'done',
		title: '피아노 세트 거래완료',
		body: '거래 끝났습니다. 감사합니다!',
		cart: [
			['grandPiano', 1, 25, 'bell'],
			['pianoChair', 2, 1, 'mileticket'],
		],
	},
	{
		type: 'sell',
		title: '별의 조각 대량 판매',
		body: '유성우 날이라 많이 주웠어요.',
		cart: [
			['starFragment', 30, 1, 'bell'],
			['largeStarFragment', 3, 3, 'bell'],
		],
	},
	{
		type: 'buy',
		title: '페더 사진 구합니다',
		body: '최애 주민 사진 모으는 중이에요.',
		cart: [['featherPhoto', 1, 3, 'mileticket']],
	},
	{
		type: 'sell',
		title: '금 도구 세트 팔아요',
		body: '금 삽 레시피, 금 물뿌리개 같이 드려요.',
		cart: [
			['goldShovelRecipe', 1, 2, 'mileticket'],
			['goldWateringCan', 1, 12, 'bell'],
		],
	},
];

const EXTRA_COMMUNITY_DRAFTS = [
	{
		type: 'general',
		title:
			'동숲 3년 차인데 아직도 섬 꾸미기를 못 끝냈어요 다들 섬 완성하는 데 얼마나 걸리셨나요 저만 이렇게 오래 걸리는 건지 궁금해요',
		body: '꾸미다 갈아엎다를 반복하고 있어요. 다들 어떻게 하시나요?',
		imageCount: 2,
	},
	{ type: 'adopt', title: '쭈니 입양하고 싶어요', body: '쭈니 보내실 분 계신가요?', imageCount: 0, villagers: ['jjuni'] },
	{ type: 'guide', title: '무 주식 기본 패턴 정리', body: '월요일 오전 가격으로 패턴을 대충 예측할 수 있어요.', imageCount: 1 },
	{ type: 'dream', title: '벚꽃섬 꿈번지 열었어요', body: '벚꽃 시즌 섬 구경 오세요!', imageCount: 3 },
	{ type: 'trade', title: '만지작 구경 오실 분', body: '오늘 만지작 열어요. 댓글 주세요.', imageCount: 0 },
	{ type: 'design', title: '마이디자인 원피스 공유', body: '봄 원피스 만들어 봤어요.', imageCount: 2 },
	{ type: 'parttime', title: '섬 정리 알바 구해요', body: '잡초 뽑기 도와주실 분! 사례는 마일로 드려요.', imageCount: 0 },
	{
		type: 'giveaway',
		title: '잭슨, 미애 분양합니다',
		body: '두 주민 모두 이사 준비 중이에요.',
		imageCount: 0,
		villagers: ['jackson', 'miae'],
	},
	{ type: 'turnip', title: '무 가격 610벨 떴어요!!', body: '오후까지 열어둘게요.', imageCount: 1 },
	{ type: 'general', title: '오늘 너굴 상점 뭐 팔아요?', body: '저희 섬은 소파가 나왔어요.', imageCount: 0 },
	{ type: 'guide', title: '화석 빨리 모으는 법', body: '매일 4개씩 꼭 파세요. 친구 섬도 돌면 더 빨라요.', imageCount: 1 },
	{ type: 'dream', title: '야경 테마 꿈번지', body: '밤에 오시면 더 예뻐요.', imageCount: 4 },
	{ type: 'general', title: '다들 몇 시에 접속하세요?', body: '저는 퇴근하고 밤에 해요.', imageCount: 0 },
	{ type: 'design', title: '바닥 길 디자인 공유합니다', body: '돌길 디자인이에요. 자유롭게 쓰세요!', imageCount: 3 },
	{ type: 'adopt', title: '힘드러 다시 데려오고 싶어요', body: '떠나보낸 걸 후회 중이에요 ㅠㅠ', imageCount: 1, villagers: ['himdeureo'] },
];

const EXTRA_POST_CREATORS = [USER_1, USER_2, USER_3];
const extraPostCreatedAt = (index) => ago(3 * DAY + (index + 1) * 7 * HOUR);

// ─── 댓글·답글 생성 ───────────────────────────────────────────────────────────

// 모든 게시글에 같은 규칙으로 댓글을 붙여, 시드를 다시 돌려도 같은 결과가 나오게 한다.
const COMMENT_COUNTS = [5, 3, 8, 0, 4, 6, 2, 7, 3, 5];
const REPLY_COUNTS = [2, 0, 1, 3, 0, 1, 0, 2];

const COMMENT_BODIES = {
	Boards: [
		'아직 거래 가능한가요?',
		'가격 조정 가능할까요?',
		'채팅 드렸어요! 확인 부탁드려요',
		'저도 관심 있어요',
		'다른 색상도 있나요?',
		'오늘 저녁에 거래 가능하신가요?',
		'혹시 마일로도 가능할까요?',
		'수량 더 있으신가요?',
		'예약 가능할까요?',
		'좋은 가격이네요!',
	],
	Communities: [
		'완전 공감해요 ㅋㅋ',
		'좋은 정보 감사합니다!',
		'저도 그래요 ㅠㅠ',
		'사진 너무 예뻐요',
		'저도 놀러 가고 싶어요',
		'오 처음 알았어요',
		'저희 섬도 비슷해요',
		'다음에 또 올려주세요!',
		'이거 진짜 꿀팁이네요',
		'부럽습니다…',
	],
};
const REPLY_BODIES = [
	'네 가능해요!',
	'감사합니다 ㅎㅎ',
	'채팅으로 이야기해요',
	'맞아요 맞아요',
	'아쉽지만 이미 나갔어요 ㅠㅠ',
	'조금만 기다려 주세요',
	'좋아요!',
	'저도 궁금했어요',
];

// 작성 시점에서 지금까지를 (count + 1)등분해 k번째 시각을 고른다
const spreadUntilNow = (startedAt, index, count) => {
	const age = Date.now() - startedAt.getTime();
	return new Date(Date.now() - age * (1 - (index + 1) / (count + 1)));
};

function generateThreads(collection, posts) {
	const users = [USER_1, USER_2, USER_3];

	return posts.map((post, postIndex) => {
		const commentCount = COMMENT_COUNTS[postIndex % COMMENT_COUNTS.length];
		const comments = Array.from({ length: commentCount }, (_, commentIndex) => {
			const seed = postIndex + commentIndex;
			const commentId = `${post.id}-c${commentIndex + 1}`;
			const commentCreatorId = users[(postIndex + commentIndex + 1) % users.length];
			const commentCreatedAt = spreadUntilNow(post.createdAt, commentIndex, commentCount);
			const replyCount = REPLY_COUNTS[seed % REPLY_COUNTS.length];

			const replies = [];
			for (let replyIndex = 0; replyIndex < replyCount; replyIndex++) {
				// 짝수 번째는 댓글에, 홀수 번째는 바로 앞 답글에 단다 (대댓글의 대댓글)
				const parentId = replyIndex % 2 === 0 ? commentId : replies[replyIndex - 1].id;
				replies.push({
					id: `${commentId}-r${replyIndex + 1}`,
					body: REPLY_BODIES[(seed + replyIndex) % REPLY_BODIES.length],
					// 게시글 작성자와 댓글 작성자가 번갈아 답한다
					creatorId: replyIndex % 2 === 0 ? post.creatorId : commentCreatorId,
					parentId,
					createdAt: spreadUntilNow(commentCreatedAt, replyIndex, replyCount),
				});
			}

			return {
				id: commentId,
				body: COMMENT_BODIES[collection][seed % COMMENT_BODIES[collection].length],
				creatorId: commentCreatorId,
				createdAt: commentCreatedAt,
				replies,
			};
		});

		return { collection, postId: post.id, comments };
	});
}

// ─── 이미지 배정 ──────────────────────────────────────────────────────────────

// 이미지 URL 목록에서 offset부터 count개를 차례로 고른다. 모자라면 처음부터 다시 쓴다.
const pickImages = (urls, offset, count) => {
	if (urls.length === 0) return [];
	return Array.from({ length: count }, (_, i) => urls[(offset + i) % urls.length]);
};

// ─── 시드 데이터 ──────────────────────────────────────────────────────────────

function buildSeedData({ userPhotoUrls = [], communityImageUrls = [] } = {}) {
	const userPhotoUrl = (index) => pickImages(userPhotoUrls, index, 1)[0] ?? '';

	// review 집계는 아래 reviews에서 계산해 채운다
	const users = [
		{
			uid: USER_1,
			email: 'test1@example.com',
			displayName: '모동숲러버',
			islandName: '꿈의섬',
			photoURL: userPhotoUrl(0),
			oauthType: 'apple',
			fruit: 'peach',
			titleFirst: '부지런한',
			titleLast: '수집가',
			bio: '벚꽃 가구 모으는 중!',
			createdAt: ago(30 * DAY),
			lastLogin: ago(10 * MINUTE),
		},
		{
			uid: USER_2,
			email: 'test2@example.com',
			displayName: '동숲마니아',
			islandName: '행복섬',
			photoURL: userPhotoUrl(1),
			oauthType: 'kakao',
			fruit: 'cherry',
			createdAt: ago(7 * DAY),
			lastLogin: ago(1 * HOUR),
		},
		{
			uid: USER_3,
			email: 'test3@example.com',
			displayName: '무인도생활',
			islandName: '평화섬',
			photoURL: userPhotoUrl(2),
			oauthType: 'naver',
			createdAt: ago(14 * DAY),
			lastLogin: ago(2 * HOUR),
		},
	];

	// 마켓 게시글 (Boards) — commentCount는 아래 comments에서 계산해 채운다
	const boards = [
		{
			id: 'board1',
			type: 'buy',
			title: '벚꽃 가구 구해요!',
			body: '벚꽃 초롱이랑 벚꽃 시계 구합니다. 마일 티켓으로 드릴게요. 댓글이나 채팅 주세요~',
			cart: [
				toCartItem(ITEMS.sakuraLantern, 1, 3, 'mileticket'),
				toCartItem(ITEMS.sakuraClock, 1, 2, 'mileticket'),
			],
			chatRoomIds: [CHAT_1_3],
			creatorId: USER_1,
			createdAt: ago(1 * DAY),
			reviewPromptSent: false,
		},
		{
			id: 'board2',
			type: 'sell',
			title: '페더 사진 팔아요',
			body: '페더 사진 판매합니다. 거래는 제 섬에서 해요. 댓글로 연락주세요!',
			cart: [toCartItem(ITEMS.featherPhoto, 1, 5, 'bell')],
			chatRoomIds: [],
			creatorId: USER_2,
			createdAt: ago(12 * HOUR),
			reviewPromptSent: false,
		},
		{
			id: 'board3',
			type: 'sell',
			title: '금 삽 레시피 나눔',
			body: '금 삽 레시피 여러 장 있어요. 선착순으로 드립니다. 금 물뿌리개도 같이 팔아요.',
			cart: [
				toCartItem(ITEMS.goldShovelRecipe, 3, 1, 'mileticket'),
				toCartItem(ITEMS.goldWateringCan, 1, 10, 'bell'),
			],
			chatRoomIds: [CHAT_2_3],
			creatorId: USER_3,
			createdAt: ago(2 * HOUR),
			reviewPromptSent: false,
		},
		{
			id: 'board4',
			type: 'buy',
			title: '그랜드 피아노, 피아노 의자 구해요',
			body: '블랙 색상으로 구하고 있어요. 덩이나 마일 티켓 둘 다 가능합니다!',
			cart: [
				toCartItem(ITEMS.grandPiano, 1, 30, 'bell'),
				toCartItem(ITEMS.pianoChair, 1, 2, 'mileticket'),
			],
			chatRoomIds: [],
			creatorId: USER_1,
			createdAt: ago(1 * HOUR),
			reviewPromptSent: false,
		},
		{
			id: 'board5',
			type: 'done',
			title: '별의 조각 판매 (거래완료)',
			body: '별의 조각 거래 완료되었습니다. 좋은 거래 감사합니다!',
			cart: [
				toCartItem(ITEMS.starFragment, 10, 1, 'bell'),
				toCartItem(ITEMS.largeStarFragment, 1, 3, 'bell'),
			],
			chatRoomIds: [CHAT_1_2],
			creatorId: USER_2,
			createdAt: ago(2 * DAY),
			reviewPromptSent: true,
		},
		{
			id: 'board6',
			type: 'done',
			title: '금 물뿌리개 팔았어요 (거래완료)',
			body: '금 물뿌리개 거래 끝났습니다.',
			cart: [toCartItem(ITEMS.goldWateringCan, 1, 8, 'bell')],
			chatRoomIds: [CHAT_2_3],
			creatorId: USER_3,
			createdAt: ago(3 * DAY),
			reviewPromptSent: true,
		},
		...EXTRA_BOARD_DRAFTS.map(({ cart, ...post }, index) => ({
			id: `board${index + 7}`,
			...post,
			cart: cart.map(([itemKey, quantity, price, unit]) =>
				toCartItem(ITEMS[itemKey], quantity, price, unit),
			),
			chatRoomIds: [],
			creatorId: EXTRA_POST_CREATORS[index % EXTRA_POST_CREATORS.length],
			createdAt: extraPostCreatedAt(index),
			reviewPromptSent: post.type === 'done',
		})),
	];

	// 커뮤니티 게시글 (Communities) — imageCount만큼 communityImageUrls에서 차례로 배정
	const communityDrafts = [
		{
			id: 'community1',
			type: 'general',
			title: '다들 최애 주민이 누구인가요?!',
			body: '저는 쭈니가 최애입니다! 잠자는 모습이 너무 사랑스러워요. 다들 최애 주민 자랑해주세요!',
			creatorId: USER_1,
			createdAt: ago(1 * HOUR),
			imageCount: 2,
			villagers: [VILLAGERS.jjuni, VILLAGERS.jackson, VILLAGERS.miae],
		},
		{
			id: 'community2',
			type: 'dream',
			title: '제 섬 꿈번지 공유해요',
			body: '섬 꾸미기 드디어 완성했어요! 꿈번지 놀러 와서 구경해주세요~',
			creatorId: USER_2,
			createdAt: ago(2 * HOUR),
			imageCount: 3,
		},
		{
			id: 'community3',
			type: 'guide',
			title: '타란툴라 잡는 팁',
			body: '타란툴라가 다가오면 멈추고, 앞발을 내리면 천천히 다가가세요. 이 방법으로 오늘 세 마리 잡았어요!',
			creatorId: USER_3,
			createdAt: ago(3 * HOUR),
			imageCount: 1,
		},
		{
			id: 'community4',
			type: 'giveaway',
			title: '힘드러 분양합니다',
			body: '힘드러가 이사 간다고 해서 분양해요. 데려가실 분 댓글 주세요!',
			creatorId: USER_2,
			createdAt: ago(4 * HOUR),
			// 이미지가 없으면 섬네일에 첫 번째 주민 이미지가 보인다 (CommunityThumbnail)
			imageCount: 0,
			villagers: [VILLAGERS.himdeureo],
		},
		{
			id: 'community5',
			type: 'turnip',
			title: '오늘 무 가격 520벨!',
			body: '오전 무 가격 520벨 떴어요. 팔러 오실 분 댓글 남겨주세요.',
			creatorId: USER_1,
			createdAt: ago(5 * HOUR),
			imageCount: 4,
		},
		...EXTRA_COMMUNITY_DRAFTS.map(({ villagers = [], ...post }, index) => ({
			id: `community${index + 6}`,
			...post,
			villagers: villagers.map((key) => VILLAGERS[key]),
			creatorId: EXTRA_POST_CREATORS[(index + 1) % EXTRA_POST_CREATORS.length],
			createdAt: extraPostCreatedAt(index),
		})),
	];

	let communityImageOffset = 0;
	const communities = communityDrafts.map(({ imageCount, villagers = [], ...post }) => {
		const images = pickImages(communityImageUrls, communityImageOffset, imageCount);
		communityImageOffset += imageCount;
		return { ...post, images, villagers };
	});

	// 댓글·대댓글 — {collection}/{postId}/Comments/{commentId}/Replies
	// 손으로 쓴 대화 + 모든 게시글에 규칙대로 생성한 댓글
	const handWrittenThreads = [
		{
			collection: 'Boards',
			postId: 'board1',
			comments: [
				{
					id: 'comment1',
					body: '벚꽃 초롱 있어요! 채팅 드릴게요',
					creatorId: USER_3,
					createdAt: ago(20 * HOUR),
					replies: [
						{
							id: 'reply1',
							body: '감사합니다! 채팅 확인할게요',
							creatorId: USER_1,
							parentId: 'comment1',
							createdAt: ago(19 * HOUR),
						},
					],
				},
				{
					id: 'comment2',
					body: '벚꽃 시계는 색상 뭐 원하세요?',
					creatorId: USER_2,
					createdAt: ago(18 * HOUR),
					replies: [
						{
							id: 'reply2',
							body: '핑크로 부탁드려요!',
							creatorId: USER_1,
							parentId: 'comment2',
							createdAt: ago(17 * HOUR),
						},
						{
							id: 'reply3',
							body: '핑크는 지금 없어요 ㅠㅠ',
							creatorId: USER_2,
							parentId: 'reply2',
							createdAt: ago(16 * HOUR),
						},
					],
				},
			],
		},
		{
			collection: 'Boards',
			postId: 'board2',
			comments: [
				{
					id: 'comment3',
					body: '구매하고 싶어요! 아직 있나요?',
					creatorId: USER_1,
					createdAt: ago(10 * HOUR),
					replies: [],
				},
			],
		},
		{
			collection: 'Boards',
			postId: 'board3',
			comments: [
				{
					id: 'comment4',
					body: '금 삽 레시피 한 장 부탁드려요',
					creatorId: USER_2,
					createdAt: ago(90 * MINUTE),
					replies: [
						{
							id: 'reply4',
							body: '네 채팅 드렸어요!',
							creatorId: USER_3,
							parentId: 'comment4',
							createdAt: ago(80 * MINUTE),
						},
					],
				},
			],
		},
		{
			collection: 'Communities',
			postId: 'community1',
			comments: [
				{
					id: 'comment5',
					body: '저는 주디요! 너무 귀여워요',
					creatorId: USER_2,
					createdAt: ago(50 * MINUTE),
					replies: [
						{
							id: 'reply5',
							body: '주디 진짜 귀엽죠 ㅎㅎ',
							creatorId: USER_1,
							parentId: 'comment5',
							createdAt: ago(40 * MINUTE),
						},
					],
				},
				{
					id: 'comment6',
					body: '잭슨 최고입니다',
					creatorId: USER_3,
					createdAt: ago(30 * MINUTE),
					replies: [],
				},
			],
		},
		{
			collection: 'Communities',
			postId: 'community3',
			comments: [
				{
					id: 'comment7',
					body: '팁 감사합니다! 저도 해볼게요',
					creatorId: USER_1,
					createdAt: ago(2 * HOUR),
					replies: [],
				},
			],
		},
	];

	const commentThreads = [
		...handWrittenThreads,
		...generateThreads('Boards', boards),
		...generateThreads('Communities', communities),
	];

	// 게시글의 commentCount는 댓글 + 대댓글 수 (functions/src/triggers/comments.ts, replies.ts와 같은 기준)
	// 한 게시글에 스레드가 여러 개(손으로 쓴 것 + 생성한 것)일 수 있어 합산한다
	const countByPost = new Map();
	for (const { collection, postId, comments } of commentThreads) {
		const replyCount = comments.reduce((sum, comment) => sum + comment.replies.length, 0);
		const key = `${collection}/${postId}`;
		countByPost.set(key, (countByPost.get(key) ?? 0) + comments.length + replyCount);
	}
	const withCommentCount = (collection) => (post) => ({
		...post,
		commentCount: countByPost.get(`${collection}/${post.id}`) ?? 0,
		status: 'active',
	});

	// 채팅방과 메시지 — Chats/{chatId}/Messages
	const chatThreads = [
		{
			participants: [USER_1, USER_2],
			messages: [
				{ senderId: USER_1, body: '별의 조각 구매하고 싶어요!', createdAt: ago(2 * DAY + 2 * HOUR) },
				{ senderId: USER_2, body: '네! 지금 섬 열어둘게요', createdAt: ago(2 * DAY + HOUR) },
				{ senderId: USER_1, body: '거래 감사합니다!', createdAt: ago(2 * DAY) },
				{ senderId: USER_2, body: '다음에 또 거래해요~', createdAt: ago(30 * MINUTE), unread: true },
			],
		},
		{
			participants: [USER_1, USER_3],
			messages: [
				{ senderId: USER_3, body: '벚꽃 초롱 있어요!', createdAt: ago(19 * HOUR) },
				{ senderId: USER_1, body: '마일 3장 괜찮으세요?', createdAt: ago(18 * HOUR) },
				{ senderId: USER_3, body: '좋아요. 언제 가능하세요?', createdAt: ago(2 * HOUR), unread: true },
				{ senderId: USER_3, body: '오늘 저녁도 괜찮아요', createdAt: ago(1 * HOUR), unread: true },
			],
		},
		{
			participants: [USER_2, USER_3],
			messages: [
				{ senderId: USER_2, body: '금 삽 레시피 신청합니다!', createdAt: ago(3 * DAY + HOUR) },
				{ senderId: USER_3, body: '네 드릴게요. 금 물뿌리개도 필요하세요?', createdAt: ago(3 * DAY) },
				{ senderId: USER_2, body: '감사합니다! 정말 도움이 됐어요', createdAt: ago(70 * MINUTE) },
			],
		},
	];

	const chats = chatThreads.map(({ participants, messages }) => {
		const [userA, userB] = participants;
		const lastMessage = messages[messages.length - 1];
		const unreadCount = Object.fromEntries(
			participants.map((uid) => [
				uid,
				messages.filter((message) => message.unread && message.senderId !== uid).length,
			]),
		);

		return {
			id: generateChatId(userA, userB),
			participants,
			visibleTo: participants,
			lastMessage: lastMessage.body,
			lastMessageSenderId: lastMessage.senderId,
			unreadCount,
			updatedAt: lastMessage.createdAt,
			messages: messages.map(({ unread, ...message }, index) => {
				const receiverId = message.senderId === userA ? userB : userA;
				return {
					id: `message${index + 1}`,
					...message,
					receiverId,
					isReadBy: unread ? [message.senderId] : participants,
				};
			}),
		};
	});

	// 리뷰 — 거래완료 게시글과 그 채팅방을 참조
	const reviews = [
		{ id: 'review1', postId: 'board5', chatId: CHAT_1_2, senderId: USER_1, receiverId: USER_2, value: 1, createdAt: ago(2 * DAY) },
		{ id: 'review2', postId: 'board5', chatId: CHAT_1_2, senderId: USER_2, receiverId: USER_1, value: 1, createdAt: ago(2 * DAY) },
		{ id: 'review3', postId: 'board6', chatId: CHAT_2_3, senderId: USER_2, receiverId: USER_3, value: -1, createdAt: ago(3 * DAY) },
		{ id: 'review4', postId: 'board6', chatId: CHAT_2_3, senderId: USER_3, receiverId: USER_2, value: 1, createdAt: ago(3 * DAY) },
	];

	// 유저 review 집계 — functions/src/triggers/reviews.ts와 같은 기준
	const reviewSummary = (uid) => {
		const received = reviews.filter((review) => review.receiverId === uid);
		const positive = received.filter((review) => review.value === 1).length;
		const negative = received.filter((review) => review.value === -1).length;
		const total = positive + negative;
		return {
			total,
			positive,
			negative,
			badgeGranted: total >= 10 && positive / total >= 0.8,
		};
	};

	// 알림 — 시드된 댓글·대댓글마다 앱(commentService.ts, replyService.ts)과 같은 규칙으로 만든다
	// 댓글: 게시글 작성자에게 / 대댓글: parentId(댓글 또는 대댓글) 작성자에게 / 본인에게는 만들지 않는다
	const postCreatorOf = (collection, postId) =>
		(collection === 'Boards' ? boards : communities).find((post) => post.id === postId).creatorId;

	const notificationDrafts = commentThreads.flatMap(({ collection, postId, comments }) => {
		const postCreatorId = postCreatorOf(collection, postId);
		return comments.flatMap((comment) => {
			const creatorById = new Map([
				[comment.id, comment.creatorId],
				...comment.replies.map((reply) => [reply.id, reply.creatorId]),
			]);
			const commentNotification = {
				actionType: 'comment',
				receiverId: postCreatorId,
				senderId: comment.creatorId,
				body: comment.body,
				createdAt: comment.createdAt,
			};
			const replyNotifications = comment.replies.map((reply) => ({
				actionType: 'reply',
				receiverId: creatorById.get(reply.parentId),
				senderId: reply.creatorId,
				body: reply.body,
				createdAt: reply.createdAt,
			}));
			return [commentNotification, ...replyNotifications]
				.filter((draft) => draft.receiverId !== draft.senderId)
				.map((draft) => ({ ...draft, type: collection, postId }));
		});
	});

	// 읽음과 안 읽음을 번갈아 섞는다
	const notifications = notificationDrafts.map((draft, index) => ({
		id: `notification${index + 1}`,
		...draft,
		isRead: index % 2 === 0,
	}));

	return {
		users: users.map((user) => ({
			...user,
			report: { total: 0, recent30Days: 0, suspendUntil: null },
			review: reviewSummary(user.uid),
		})),
		boards: boards.map(withCommentCount('Boards')),
		communities: communities.map(withCommentCount('Communities')),
		commentThreads,
		chats,
		reviews,
		notifications,
	};
}

// ─── 저장 ─────────────────────────────────────────────────────────────────────

// 문서 ID로만 쓰는 id 필드는 앱이 저장하는 형태와 같게 본문에서 뺀다
const withoutId = ({ id: _id, ...data }) => data;

async function seedTestData({
	users,
	boards,
	communities,
	commentThreads,
	chats,
	reviews,
	notifications,
}) {
	for (const user of users) {
		const { uid, ...profile } = user;
		await auth.createUser({
			uid,
			email: user.email,
			displayName: user.displayName,
			...(user.photoURL && { photoURL: user.photoURL }),
		});
		await db.collection('Users').doc(uid).set(profile);
	}
	console.log(`✅ 유저 ${users.length}명`);

	for (const board of boards) {
		await db.collection('Boards').doc(board.id).set(withoutId(board));
	}
	console.log(`✅ 마켓 게시글 ${boards.length}개`);

	for (const community of communities) {
		await db.collection('Communities').doc(community.id).set(withoutId(community));
	}
	console.log(`✅ 커뮤니티 게시글 ${communities.length}개`);

	let commentTotal = 0;
	let replyTotal = 0;
	for (const { collection, postId, comments } of commentThreads) {
		for (const { replies, ...comment } of comments) {
			const commentRef = db
				.collection(collection)
				.doc(postId)
				.collection('Comments')
				.doc(comment.id);
			await commentRef.set(withoutId(comment));
			commentTotal++;

			for (const reply of replies) {
				await commentRef.collection('Replies').doc(reply.id).set(withoutId(reply));
				replyTotal++;
			}
		}
	}
	console.log(`✅ 댓글 ${commentTotal}개, 대댓글 ${replyTotal}개`);

	let messageTotal = 0;
	for (const { messages, ...chat } of chats) {
		const chatRef = db.collection('Chats').doc(chat.id);
		await chatRef.set(chat);

		for (const message of messages) {
			await chatRef.collection('Messages').doc(message.id).set(withoutId(message));
			messageTotal++;
		}
	}
	console.log(`✅ 채팅방 ${chats.length}개, 메시지 ${messageTotal}개`);

	for (const review of reviews) {
		await db.collection('Reviews').doc(review.id).set(withoutId(review));
	}
	console.log(`✅ 리뷰 ${reviews.length}개`);

	for (const notification of notifications) {
		await db.collection('Notifications').doc(notification.id).set(withoutId(notification));
	}
	console.log(`✅ 알림 ${notifications.length}개`);
}

async function main() {
	console.log('🌱 에뮬레이터 시드 시작...');
	const triggersDisabled = await disableBackgroundTriggers();
	if (triggersDisabled) console.log('⏸️  Functions 트리거를 껐습니다');

	try {
		await resetEmulator();
		console.log('🧹 Auth·Firestore·Storage 초기화');

		const { userPhotoUrls, communityImageUrls } = await uploadSeedImages();
		console.log(`✅ 이미지 업로드: 프로필 ${userPhotoUrls.length}장, 커뮤니티 ${communityImageUrls.length}장`);

		const catalog = await seedCatalog();
		if (catalog) {
			console.log(`✅ 카탈로그 아이템 ${catalog.itemCount}개, variants ${catalog.variantCount}개`);
		}

		const villagerCount = await seedVillagers();
		if (villagerCount !== null) console.log(`✅ 주민 ${villagerCount}명`);

		await seedTestData(buildSeedData({ userPhotoUrls, communityImageUrls }));
	} finally {
		if (triggersDisabled) {
			await enableBackgroundTriggers();
			console.log('▶️  Functions 트리거를 다시 켰습니다');
		}
	}

	console.log('🎉 시드 완료! 에뮬레이터 UI에서 확인: http://localhost:4000');
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('❌ 시드 실패:', error);
		process.exit(1);
	});
