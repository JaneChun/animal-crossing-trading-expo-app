const { auth, db } = require('./firebase-admin-setup');

// 테스트 사용자 데이터
const testUsers = [
	{
		uid: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
		email: 'test1@example.com',
		displayName: '모동숲러버',
		photoURL: 'https://via.placeholder.com/150',
		activeChatRoomId: '',
		createdAt: new Date(),
		islandName: '꿈의섬',
		lastLogin: new Date(),
		oauthType: 'apple',
		photoURL: 'https://via.placeholder.com/150',
		report: {
			recent30Days: 0,
			suspendUntil: null,
			total: 0,
		},
		review: {
			badgeGranted: false,
			negative: 0,
			positive: 15,
			total: 15,
		},
	},
	{
		uid: 'u_s_e_r_2',
		email: 'test2@example.com',
		displayName: '동숲마니아',
		photoURL: 'https://via.placeholder.com/150',
		activeChatRoomId: '',
		createdAt: new Date(Date.now() - 86400000 * 7), // 7일 전
		islandName: '행복섬',
		lastLogin: new Date(Date.now() - 3600000), // 1시간 전
		oauthType: 'kakao',
		photoURL: 'https://via.placeholder.com/150',
		report: {
			recent30Days: 0,
			suspendUntil: null,
			total: 0,
		},
		review: {
			badgeGranted: true,
			negative: 1,
			positive: 25,
			total: 26,
		},
	},
	{
		uid: 'user3',
		email: 'test3@example.com',
		displayName: '무인도생활',
		photoURL: 'https://via.placeholder.com/150',
		activeChatRoomId: '',
		createdAt: new Date(Date.now() - 86400000 * 14), // 14일 전
		islandName: '평화섬',
		lastLogin: new Date(Date.now() - 7200000), // 2시간 전
		oauthType: 'naver',
		photoURL: 'https://via.placeholder.com/150',
		report: {
			recent30Days: 0,
			suspendUntil: null,
			total: 0,
		},
		review: {
			badgeGranted: false,
			negative: 0,
			positive: 8,
			total: 8,
		},
	},
];

// 테스트 게시글 데이터 (boards 컬렉션)
const testBoards = [
	{
		id: 'board1',
		body: '벚꽃 시즌 가구들 교환하실 분 찾아요. 벚꽃 꽃잎 더미, 벚꽃 가지 등 있습니다. 달 의자나 별 조각 가구와 교환하고 싶어요! 언제든 댓글 남겨주세요~',
		chatRoomIds: [],
		commentCount: 8,
		createdAt: new Date(Date.now() - 86400000), // 1일 전
		creatorId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
		reviewPromptSent: false,
		title: '벚꽃 가구 교환해요!',
		type: 'buy',
	},
	{
		id: 'board2',
		status: 'active',
		body: '마샬 사진 판매합니다! 500만 벨에 드려요. 정말 귀여운 마샬 사진이니까 꼭 소장하세요~ 거래는 제 섬에서 하거나 방문해서 할 수 있어요. 댓글로 연락주세요!',
		chatRoomIds: ['chat2'],
		commentCount: 15,
		createdAt: new Date(Date.now() - 43200000), // 12시간 전
		creatorId: 'u_s_e_r_2',
		reviewPromptSent: false,
		title: '마샬 사진 팔아요',
		type: 'sell',
	},
	{
		id: 'board3',
		status: 'active',
		body: '황금 도구 레시피들 나눔합니다! 황금 삽, 황금 물뿌리개, 황금 낚싯대 레시피 있어요. 선착순으로 드릴게요! 댓글로 원하는 레시피 말씀해주세요~',
		chatRoomIds: [],
		commentCount: 32,
		createdAt: new Date(Date.now() - 7200000), // 2시간 전
		creatorId: 'user3',
		reviewPromptSent: false,
		title: '황금 도구 레시피 나눔',
		type: 'sell',
	},
	{
		id: 'board4',
		status: 'active',
		body: '그랜드 피아노와 피아노 의자를 구하고 있어요! 음악을 정말 좋아해서 꼭 구해보고 싶었는데, 혹시 가지고 계신 분 있으면 거래해요. 벨로 사거나 다른 가구와 교환도 가능해요!',
		chatRoomIds: [],
		commentCount: 5,
		createdAt: new Date(Date.now() - 3600000), // 1시간 전
		creatorId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
		reviewPromptSent: false,
		title: '그랜드 피아노, 피아노 의자 구해요',
		type: 'buy',
	},
	{
		id: 'board5',
		status: 'active',
		body: '쥬디 사진 거래 완료되었습니다! 정말 좋은 거래였어요. 다음에 또 거래하게 되면 연락드릴게요~ 감사합니다!',
		chatRoomIds: ['chat3'],
		commentCount: 3,
		createdAt: new Date(Date.now() - 172800000), // 2일 전
		creatorId: 'u_s_e_r_2',
		reviewPromptSent: true,
		title: '쥬디 사진 판매 (거래완료)',
		type: 'done',
	},
];

// 테스트 커뮤니티 데이터 (communities 컬렉션)
const testCommunities = [
	{
		id: 'community1',
		status: 'active',
		body: '저는 마샬이 최애입니다! 정말 귀엽고 성격도 좋아요. 특히 잠자는 모습이 너무 사랑스러워요 ㅠㅠ 다들 최애 주민 자랑해주세요!',
		chatRoomIds: [],
		commentCount: 15,
		createdAt: new Date(Date.now() - 3600000),
		creatorId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
		images: [
			'https://via.placeholder.com/400x300/FFB6C1/000000?text=마샬1',
			'https://via.placeholder.com/400x300/FFB6C1/000000?text=마샬2',
		],
		reviewPromptSent: false,
		title: '다들 최애 주민이 누구인가요?!',
		type: 'general',
	},
	{
		id: 'community2',
		status: 'active',
		body: '드디어 제 섬 꾸미기가 완성되었어요! 정말 오랜 시간 공들여서 만들었는데, 어떤지 평가해주세요~ 특히 박물관 앞 정원이 제일 마음에 들어요!',
		chatRoomIds: [],
		commentCount: 23,
		createdAt: new Date(Date.now() - 7200000),
		creatorId: 'u_s_e_r_2',
		images: [
			'https://via.placeholder.com/400x300/98FB98/000000?text=섬꾸미기1',
			'https://via.placeholder.com/400x300/98FB98/000000?text=섬꾸미기2',
			'https://via.placeholder.com/400x300/98FB98/000000?text=섬꾸미기3',
		],
		reviewPromptSent: false,
		title: '제 섬 꾸미기 완성했어요!',
		type: 'dream',
	},
	{
		id: 'community3',
		status: 'active',
		body: '오늘 처음으로 타란툴라를 잡았어요! 정말 무서웠는데 용기내서 잡았답니다 ㅎㅎ 벌레 잡기 팁 있으면 알려주세요~',
		chatRoomIds: [],
		commentCount: 8,
		createdAt: new Date(Date.now() - 10800000),
		creatorId: 'user3',
		images: ['https://via.placeholder.com/400x300/DDA0DD/000000?text=타란툴라'],
		reviewPromptSent: false,
		title: '타란툴라 첫 포획 성공!',
		type: 'guide',
	},
	{
		id: 'community4',
		status: 'active',
		body: '힘드러라는 주민이 제 섬에 이사왔는데요! 할부지 같이 생기고 이름도 힘드러면서 운동광 성격인게 너무 킹받고 귀여워요.. 다들 어떤 주민이 특이한가요?',
		chatRoomIds: [],
		commentCount: 12,
		createdAt: new Date(Date.now() - 14400000),
		creatorId: 'u_s_e_r_2',
		images: [
			'https://via.placeholder.com/400x300/F0E68C/000000?text=힘드러1',
			'https://via.placeholder.com/400x300/F0E68C/000000?text=힘드러2',
			'https://via.placeholder.com/400x300/F0E68C/000000?text=힘드러3',
			'https://via.placeholder.com/400x300/F0E68C/000000?text=힘드러4',
		],
		reviewPromptSent: false,
		title: '힘드러 주민 너무 웃겨요 ㅋㅋ',
		type: 'general',
	},
	{
		id: 'community5',
		status: 'active',
		body: '벚꽃 시즌이 끝나가는데 너무 아쉬워요 ㅠㅠ 벚꽃 꽃잎이 떨어지는 모습이 정말 예뻤는데... 다들 어떤 시즌을 가장 좋아하시나요?',
		chatRoomIds: [],
		commentCount: 18,
		createdAt: new Date(Date.now() - 18000000),
		creatorId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
		images: [
			'https://via.placeholder.com/400x300/FFB6C1/000000?text=벚꽃시즌1',
			'https://via.placeholder.com/400x300/FFB6C1/000000?text=벚꽃시즌2',
		],
		reviewPromptSent: false,
		title: '벚꽃 시즌 너무 예뻐요!',
		type: 'general',
	},
];

// 테스트 채팅방 데이터 (chat 컬렉션)
const testChats = [
	{
		id: '001827.95fec4cf29524bfbb08744e92ef6050a.0427_u_s_e_r_2',
		lastMessage: '마샬 사진 구매하고 싶어요!',
		lastMessageSenderId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
		participants: ['001827.95fec4cf29524bfbb08744e92ef6050a.0427', 'u_s_e_r_2'],
		unreadCount: {
			'00182795fec4cf29524bfbb08744e92ef6050a0427': 0,
			u_s_e_r_2: 1,
		},
		updatedAt: new Date(Date.now() - 1800000), // 30분 전
		visibleTo: ['001827.95fec4cf29524bfbb08744e92ef6050a.0427', 'u_s_e_r_2'],
	},
	{
		id: 'u_s_e_r_2_user3',
		lastMessage: '황금 도구 레시피 나눔 감사합니다!',
		lastMessageSenderId: 'user3',
		participants: ['u_s_e_r_2', 'user3'],
		unreadCount: {
			u_s_e_r_2: 2,
			user3: 0,
		},
		updatedAt: new Date(Date.now() - 3600000), // 1시간 전
		visibleTo: ['u_s_e_r_2', 'user3'],
	},
	{
		id: '001827.95fec4cf29524bfbb08744e92ef6050a.0427_user3',
		lastMessage: '벚꽃 가구 교환 언제 가능한가요?',
		lastMessageSenderId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
		participants: ['001827.95fec4cf29524bfbb08744e92ef6050a.0427', 'user3'],
		unreadCount: {
			'00182795fec4cf29524bfbb08744e92ef6050a0427': 1,
			user3: 0,
		},
		updatedAt: new Date(Date.now() - 7200000), // 2시간 전
		visibleTo: ['001827.95fec4cf29524bfbb08744e92ef6050a.0427', 'user3'],
	},
];

// 테스트 메시지 데이터 (chat/{chatId}/messages 서브컬렉션) - 실제 구조에 맞게 수정
const testMessages = [
	{
		chatId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427_u_s_e_r_2',
		messages: [
			{
				body: '안녕하세요! 마샬 사진 구매하고 싶어요',
				createdAt: new Date(Date.now() - 7200000),
				isReadBy: ['001827.95fec4cf29524bfbb08744e92ef6050a.0427', 'u_s_e_r_2'],
				receiverId: 'u_s_e_r_2',
				senderId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
			},
			{
				body: '안녕하세요! 500만 벨에 드릴게요',
				createdAt: new Date(Date.now() - 7000000),
				isReadBy: ['001827.95fec4cf29524bfbb08744e92ef6050a.0427', 'u_s_e_r_2'],
				receiverId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
				senderId: 'u_s_e_r_2',
			},
			{
				body: '네! 언제 거래 가능한가요?',
				createdAt: new Date(Date.now() - 6800000),
				isReadBy: ['001827.95fec4cf29524bfbb08744e92ef6050a.0427', 'u_s_e_r_2'],
				receiverId: 'u_s_e_r_2',
				senderId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
			},
			{
				body: '지금 바로 가능해요!',
				createdAt: new Date(Date.now() - 6600000),
				isReadBy: ['001827.95fec4cf29524bfbb08744e92ef6050a.0427', 'u_s_e_r_2'],
				receiverId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
				senderId: 'u_s_e_r_2',
			},
			{
				body: '마샬 사진 구매하고 싶어요!',
				createdAt: new Date(Date.now() - 1800000),
				isReadBy: ['001827.95fec4cf29524bfbb08744e92ef6050a.0427'],
				receiverId: 'u_s_e_r_2',
				senderId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
			},
		],
	},
	{
		chatId: 'u_s_e_r_2_user3',
		messages: [
			{
				body: '황금 도구 레시피 나눔 신청합니다!',
				createdAt: new Date(Date.now() - 14400000),
				isReadBy: ['u_s_e_r_2', 'user3'],
				receiverId: 'u_s_e_r_2',
				senderId: 'user3',
			},
			{
				body: '좋습니다! 어떤 레시피를 원하시나요?',
				createdAt: new Date(Date.now() - 14200000),
				isReadBy: ['u_s_e_r_2', 'user3'],
				receiverId: 'user3',
				senderId: 'u_s_e_r_2',
			},
			{
				body: '황금 삽 레시피 부탁드려요',
				createdAt: new Date(Date.now() - 14000000),
				isReadBy: ['u_s_e_r_2', 'user3'],
				receiverId: 'u_s_e_r_2',
				senderId: 'user3',
			},
			{
				body: '네! 준비해드릴게요',
				createdAt: new Date(Date.now() - 13800000),
				isReadBy: ['u_s_e_r_2', 'user3'],
				receiverId: 'user3',
				senderId: 'u_s_e_r_2',
			},
			{
				body: '감사합니다! 정말 도움이 되었어요',
				createdAt: new Date(Date.now() - 7200000),
				isReadBy: ['user3'],
				receiverId: 'u_s_e_r_2',
				senderId: 'user3',
			},
			{
				body: '황금 도구 레시피 나눔 감사합니다!',
				createdAt: new Date(Date.now() - 3600000),
				isReadBy: ['user3'],
				receiverId: 'u_s_e_r_2',
				senderId: 'user3',
			},
		],
	},
	{
		chatId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427_user3',
		messages: [
			{
				body: '벚꽃 가구 교환하고 싶어요',
				createdAt: new Date(Date.now() - 21600000),
				isReadBy: ['001827.95fec4cf29524bfbb08744e92ef6050a.0427', 'user3'],
				receiverId: 'user3',
				senderId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
			},
			{
				body: '어떤 가구를 원하시나요?',
				createdAt: new Date(Date.now() - 21400000),
				isReadBy: ['001827.95fec4cf29524bfbb08744e92ef6050a.0427', 'user3'],
				receiverId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
				senderId: 'user3',
			},
			{
				body: '달 의자나 별 조각 가구 있으신가요?',
				createdAt: new Date(Date.now() - 21200000),
				isReadBy: ['001827.95fec4cf29524bfbb08744e92ef6050a.0427', 'user3'],
				receiverId: 'user3',
				senderId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
			},
			{
				body: '달 의자는 있어요! 교환하실래요?',
				createdAt: new Date(Date.now() - 21000000),
				isReadBy: ['001827.95fec4cf29524bfbb08744e92ef6050a.0427', 'user3'],
				receiverId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
				senderId: 'user3',
			},
			{
				body: '벚꽃 가구 교환 언제 가능한가요?',
				createdAt: new Date(Date.now() - 7200000),
				isReadBy: ['001827.95fec4cf29524bfbb08744e92ef6050a.0427'],
				receiverId: 'user3',
				senderId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
			},
		],
	},
];

// 테스트 댓글 데이터 (board/comment 서브컬렉션과 community/comment 서브컬렉션)
const testComments = [
	// board1 댓글들
	{
		collection: 'Boards',
		postId: 'board1',
		comments: [
			{
				id: 'comment1',
				body: '저요! 벚꽃 가구 정말 구하고 있었어요',
				createdAt: new Date(Date.now() - 21600000), // 6시간 전
				creatorId: 'u_s_e_r_2',
			},
			{
				id: 'comment2',
				body: '달 의자 있어요! 벚꽃 꽃잎 더미랑 교환 어떠세요?',
				createdAt: new Date(Date.now() - 18000000), // 5시간 전
				creatorId: 'user3',
			},
			{
				id: 'comment3',
				body: '좋아요! 언제 거래 가능하신가요?',
				createdAt: new Date(Date.now() - 14400000), // 4시간 전
				creatorId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
			},
		],
	},
	// board2 댓글들
	{
		collection: 'Boards',
		postId: 'board2',
		comments: [
			{
				id: 'comment4',
				body: '마샬 사진 너무 귀여워요! 구매하고 싶어요',
				createdAt: new Date(Date.now() - 32400000), // 9시간 전
				creatorId: 'user3',
			},
			{
				id: 'comment5',
				body: '가격 협상 가능한가요?',
				createdAt: new Date(Date.now() - 28800000), // 8시간 전
				creatorId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
			},
			{
				id: 'comment6',
				body: '댓글로 연락주세요!',
				createdAt: new Date(Date.now() - 25200000), // 7시간 전
				creatorId: 'u_s_e_r_2',
			},
			{
				id: 'comment7',
				body: '400만 벨로 가능할까요?',
				createdAt: new Date(Date.now() - 21600000), // 6시간 전
				creatorId: 'user3',
			},
			{
				id: 'comment8',
				body: '450만 벨 어떠세요?',
				createdAt: new Date(Date.now() - 18000000), // 5시간 전
				creatorId: 'u_s_e_r_2',
			},
		],
	},
	// board3 댓글들
	{
		collection: 'Boards',
		postId: 'board3',
		comments: [
			{
				id: 'comment9',
				body: '황금 삽 레시피 주세요!',
				createdAt: new Date(Date.now() - 7200000), // 2시간 전
				creatorId: 'u_s_e_r_2',
			},
			{
				id: 'comment10',
				body: '황금 물뿌리개 레시피 구하고 있었어요',
				createdAt: new Date(Date.now() - 5400000), // 1시간 30분 전
				creatorId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
			},
			{
				id: 'comment11',
				body: '황금 낚싯대 레시피도 남아있나요?',
				createdAt: new Date(Date.now() - 3600000), // 1시간 전
				creatorId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
			},
			{
				id: 'comment12',
				body: '정말 감사합니다! 나눔 최고에요',
				createdAt: new Date(Date.now() - 1800000), // 30분 전
				creatorId: 'u_s_e_r_2',
			},
		],
	},
	// board4 댓글들
	{
		collection: 'Boards',
		postId: 'board4',
		comments: [
			{
				id: 'comment13',
				body: '그랜드 피아노 있어요! 연락주세요',
				createdAt: new Date(Date.now() - 1800000), // 30분 전
				creatorId: 'u_s_e_r_2',
			},
			{
				id: 'comment14',
				body: '피아노 의자도 같이 드릴 수 있어요',
				createdAt: new Date(Date.now() - 900000), // 15분 전
				creatorId: 'u_s_e_r_2',
			},
		],
	},
	// community1 댓글들
	{
		collection: 'Communities',
		postId: 'community1',
		comments: [
			{
				id: 'comment15',
				body: '마샬 정말 귀여워요! 저도 최애에요',
				createdAt: new Date(Date.now() - 10800000), // 3시간 전
				creatorId: 'u_s_e_r_2',
			},
			{
				id: 'comment16',
				body: '저는 쥬디가 최애입니다! 고양이 주민들 다 귀여워요',
				createdAt: new Date(Date.now() - 7200000), // 2시간 전
				creatorId: 'user3',
			},
			{
				id: 'comment17',
				body: '힘드러도 의외로 귀여워요 ㅋㅋ',
				createdAt: new Date(Date.now() - 3600000), // 1시간 전
				creatorId: 'u_s_e_r_2',
			},
		],
	},
	// community2 댓글들
	{
		collection: 'Communities',
		postId: 'community2',
		comments: [
			{
				id: 'comment18',
				body: '와 정말 예쁘게 꾸미셨네요! 부러워요',
				createdAt: new Date(Date.now() - 14400000), // 4시간 전
				creatorId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
			},
			{
				id: 'comment19',
				body: '박물관 앞 정원 정말 멋져요! 어떤 꽃들 사용하셨나요?',
				createdAt: new Date(Date.now() - 10800000), // 3시간 전
				creatorId: 'user3',
			},
		],
	},
];

// 테스트 대댓글 데이터 (board/comment/{commentId}/replies와 community/comment/{commentId}/replies 서브컬렉션)
const testReplies = [
	// board1의 comment2에 대한 대댓글들
	{
		collection: 'Boards',
		postId: 'board1',
		parentId: 'comment2',
		replies: [
			{
				body: '오 좋은 제안이네요! 언제 거래 가능한가요?',
				createdAt: new Date(Date.now() - 16200000), // 4시간 30분 전
				creatorId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
				parentId: 'comment2',
			},
			{
				body: '지금 바로 가능해요! 제 섬으로 오실래요?',
				createdAt: new Date(Date.now() - 14400000), // 4시간 전
				creatorId: 'user3',
				parentId: 'comment2',
			},
		],
	},
	// board2의 comment5에 대한 대댓글들
	{
		collection: 'Boards',
		postId: 'board2',
		parentId: 'comment5',
		replies: [
			{
				body: '450만 벨까지 가능해요!',
				createdAt: new Date(Date.now() - 25200000), // 7시간 전
				creatorId: 'u_s_e_r_2',
				parentId: 'comment5',
			},
		],
	},
	// board2의 comment7에 대한 대댓글들
	{
		collection: 'Boards',
		postId: 'board2',
		parentId: 'comment7',
		replies: [
			{
				body: '450만 벨로 하시죠! 거래 도도코드 보내드릴게요',
				createdAt: new Date(Date.now() - 19800000), // 5시간 30분 전
				creatorId: 'u_s_e_r_2',
				parentId: 'comment7',
			},
			{
				body: '좋아요! 감사합니다',
				createdAt: new Date(Date.now() - 18000000), // 5시간 전
				creatorId: 'user3',
				parentId: 'comment7',
			},
		],
	},
	// board3의 comment9에 대한 대댓글들
	{
		collection: 'Boards',
		postId: 'board3',
		parentId: 'comment9',
		replies: [
			{
				body: '네! 드릴게요~ 제 섬으로 와주세요',
				createdAt: new Date(Date.now() - 5400000), // 1시간 30분 전
				creatorId: 'user3',
				parentId: 'comment9',
			},
			{
				body: '감사해요! 지금 갈게요',
				createdAt: new Date(Date.now() - 3600000), // 1시간 전
				creatorId: 'u_s_e_r_2',
				parentId: 'comment9',
			},
		],
	},
	// board4의 comment13에 대한 대댓글들
	{
		collection: 'Boards',
		postId: 'board4',
		parentId: 'comment13',
		replies: [
			{
				body: '정말요? 몇 벨에 거래 가능한가요?',
				createdAt: new Date(Date.now() - 1440000), // 24분 전
				creatorId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
				parentId: 'comment13',
			},
			{
				body: '100만 벨에 드릴게요!',
				createdAt: new Date(Date.now() - 900000), // 15분 전
				creatorId: 'u_s_e_r_2',
				parentId: 'comment13',
			},
			{
				body: '좋아요! 거래하시죠',
				createdAt: new Date(Date.now() - 600000), // 10분 전
				creatorId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
				parentId: 'comment13',
			},
		],
	},
	// community1의 comment15에 대한 대댓글들
	{
		collection: 'Communities',
		postId: 'community1',
		parentId: 'comment15',
		replies: [
			{
				body: '마샬 팬 동지네요! 마샬 사진 혹시 있으신가요?',
				createdAt: new Date(Date.now() - 9000000), // 2시간 30분 전
				creatorId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
				parentId: 'comment15',
			},
			{
				body: '있어요! 나중에 따로 연락드릴게요 ㅎㅎ',
				createdAt: new Date(Date.now() - 7200000), // 2시간 전
				creatorId: 'u_s_e_r_2',
				parentId: 'comment15',
			},
		],
	},
	// community1의 comment16에 대한 대댓글들
	{
		collection: 'Communities',
		postId: 'community1',
		parentId: 'comment16',
		replies: [
			{
				body: '쥬디도 정말 귀여워요! 고양이 주민 최고죠',
				createdAt: new Date(Date.now() - 5400000), // 1시간 30분 전
				creatorId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
				parentId: 'comment16',
			},
		],
	},
	// community2의 comment18에 대한 대댓글들
	{
		collection: 'Communities',
		postId: 'community2',
		parentId: 'comment18',
		replies: [
			{
				body: '감사해요! 정말 오래 걸렸어요 ㅠㅠ',
				createdAt: new Date(Date.now() - 12600000), // 3시간 30분 전
				creatorId: 'u_s_e_r_2',
				parentId: 'comment18',
			},
			{
				body: '그래도 정말 예쁘게 나왔어요! 부러워요',
				createdAt: new Date(Date.now() - 10800000), // 3시간 전
				creatorId: '001827.95fec4cf29524bfbb08744e92ef6050a.0427',
				parentId: 'comment18',
			},
		],
	},
];

async function seedData() {
	try {
		console.log('🌱 테스트 데이터 생성 시작...');

		// 1. 사용자 생성
		console.log('👥 사용자 생성 중...');
		for (const user of testUsers) {
			await auth.createUser({
				uid: user.uid,
				email: user.email,
				displayName: user.displayName,
				photoURL: user.photoURL,
			});

			// Firestore 사용자 프로필 저장 (사용자 객체에서 uid를 제외한 나머지 데이터)
			const { uid, ...profileData } = user;
			await db.collection('Users').doc(user.uid).set(profileData);
			console.log(`✅ 사용자 생성 완료: ${user.displayName}`);
		}

		// 2. 게시글 생성 (boards 컬렉션)
		console.log('📝 게시글 생성 중...');
		for (const board of testBoards) {
			await db.collection('Boards').doc(board.id).set(board);
			console.log(`✅ 게시글 생성 완료: ${board.title}`);
		}

		// 3. 커뮤니티 생성 (communities 컬렉션)
		console.log('🏘️ 커뮤니티 생성 중...');
		for (const community of testCommunities) {
			await db.collection('Communities').doc(community.id).set(community);
			console.log(`✅ 커뮤니티 생성 완료: ${community.title}`);
		}

		// 4. 채팅방 생성 (chat 컬렉션)
		console.log('💬 채팅방 생성 중...');
		for (const chat of testChats) {
			await db.collection('Chats').doc(chat.id).set(chat);
			console.log(`✅ 채팅방 생성 완료: ${chat.id}`);
		}

		// 5. 메시지 생성 (chat/{chatId}/messages 서브컬렉션)
		console.log('📨 메시지 생성 중...');
		for (const messageGroup of testMessages) {
			for (const message of messageGroup.messages) {
				await db.collection('Chats').doc(messageGroup.chatId).collection('Messages').add(message);
			}
			console.log(
				`✅ 메시지 생성 완료: ${messageGroup.chatId} (${messageGroup.messages.length}개)`,
			);
		}

		// 6. 댓글 생성 (boards/{postId}/comments, communities/{postId}/comments 서브컬렉션)
		console.log('💭 댓글 생성 중...');
		let totalComments = 0;
		for (const commentGroup of testComments) {
			for (const comment of commentGroup.comments) {
				await db
					.collection(commentGroup.collection)
					.doc(commentGroup.postId)
					.collection('Comments')
					.doc(comment.id)
					.set(comment);
				totalComments++;
			}
			console.log(
				`✅ 댓글 생성 완료: ${commentGroup.collection}/${commentGroup.postId} (${commentGroup.comments.length}개)`,
			);
		}

		// 7. 대댓글 생성 (boards/{postId}/comments/{commentId}/replies, communities/{postId}/comments/{commentId}/replies 서브컬렉션)
		console.log('💬 대댓글 생성 중...');
		let totalReplies = 0;
		for (const replyGroup of testReplies) {
			for (const reply of replyGroup.replies) {
				await db
					.collection(replyGroup.collection)
					.doc(replyGroup.postId)
					.collection('Comments')
					.doc(replyGroup.parentId)
					.collection('Replies')
					.add(reply);
				totalReplies++;
			}
			console.log(
				`✅ 대댓글 생성 완료: ${replyGroup.collection}/${replyGroup.postId}/${replyGroup.parentId} (${replyGroup.replies.length}개)`,
			);
		}

		console.log('🎉 테스트 데이터 생성 완료!');
		console.log('');
		console.log('생성된 데이터:');
		console.log(`- 사용자: ${testUsers.length}명`);
		console.log(`- 게시글 (boards): ${testBoards.length}개`);
		console.log(`- 커뮤니티 (communities): ${testCommunities.length}개`);
		console.log(`- 채팅방 (chat): ${testChats.length}개`);
		console.log(
			`- 메시지: ${testMessages.reduce((total, group) => total + group.messages.length, 0)}개`,
		);
		console.log(`- 댓글: ${totalComments}개`);
		console.log(`- 대댓글: ${totalReplies}개`);
		console.log('');
		console.log('에뮬레이터 UI에서 확인: http://localhost:4000');
	} catch (error) {
		console.error('❌ 테스트 데이터 생성 실패:', error);
	}
}

seedData();
