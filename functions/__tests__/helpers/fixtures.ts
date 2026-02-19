/**
 * 테스트 Fixture 생성 함수들
 * 일관된 테스트 데이터 생성을 위한 팩토리
 */

/**
 * 테스트용 유저 데이터 생성
 */
export interface MockUser {
	uid: string;
	email: string;
	displayName: string;
	pushToken: string | null;
	photoURL?: string;
	createdAt?: Date;
}

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
	return {
		uid: 'test_user_123',
		email: 'testuser@example.com',
		displayName: '테스트유저',
		pushToken: 'ExponentPushToken[test_token_123]',
		photoURL: 'https://example.com/avatar.png',
		createdAt: new Date(),
		...overrides,
	};
}

/**
 * 테스트용 게시글 데이터 생성
 */
export interface MockPost {
	id: string;
	title: string;
	body: string;
	authorId: string;
	commentCount: number;
	createdAt?: Date;
	updatedAt?: Date;
}

export function createMockPost(overrides: Partial<MockPost> = {}): MockPost {
	return {
		id: 'post_123',
		title: '닌텐도 스위치 아이템 거래',
		body: '동물의 숲 아이템 팝니다.',
		authorId: 'author_user_456',
		commentCount: 0,
		createdAt: new Date(),
		updatedAt: new Date(),
		...overrides,
	};
}

/**
 * 테스트용 채팅 메시지 데이터 생성
 */
export interface MockChatMessage {
	_id: string;
	text: string;
	senderId: string;
	senderName: string;
	createdAt: Date;
}

export function createMockChatMessage(
	overrides: Partial<MockChatMessage> = {},
): MockChatMessage {
	return {
		_id: 'msg_123',
		text: '안녕하세요! 거래 문의드려요.',
		senderId: 'sender_user_789',
		senderName: '발신자닉네임',
		createdAt: new Date(),
		...overrides,
	};
}

/**
 * 테스트용 알림 데이터 생성 (댓글)
 */
export interface MockCommentNotification {
	receiverId: string;
	senderId: string;
	type: 'Boards' | 'Communities';
	postId: string;
	body: string;
}

export function createMockCommentNotification(
	overrides: Partial<MockCommentNotification> = {},
): MockCommentNotification {
	return {
		receiverId: 'receiver_user_456',
		senderId: 'sender_user_789',
		type: 'Boards',
		postId: 'board_post_123',
		body: '좋은 아이템이네요! 거래 가능한가요?',
		...overrides,
	};
}

/**
 * 테스트용 알림 데이터 생성 (채팅)
 */
export interface MockChatNotification {
	receiverId: string;
	senderId: string;
	senderDisplayName: string;
	chatId: string;
	body: string;
}

export function createMockChatNotification(
	overrides: Partial<MockChatNotification> = {},
): MockChatNotification {
	return {
		receiverId: 'receiver_user_456',
		senderId: 'sender_user_789',
		senderDisplayName: '발신자닉네임',
		chatId: 'chat_room_123',
		body: '거래 관련 메시지입니다.',
		...overrides,
	};
}

/**
 * 테스트용 답글 알림 데이터 생성
 */
export interface MockReplyNotification {
	receiverId: string;
	senderId: string;
	type: 'Boards' | 'Communities';
	postId: string;
	body: string;
}

export function createMockReplyNotification(
	overrides: Partial<MockReplyNotification> = {},
): MockReplyNotification {
	return {
		receiverId: 'receiver_user_456',
		senderId: 'sender_user_789',
		type: 'Boards',
		postId: 'board_post_123',
		body: '답글 감사합니다!',
		...overrides,
	};
}

/**
 * OAuth 응답 데이터 생성
 */
export interface MockNaverOAuthResponse {
	resultcode: string;
	message: string;
	response: {
		id: string | number;
		email: string;
		name?: string;
		nickname?: string;
	};
}

export function createMockNaverOAuthResponse(
	overrides: Partial<MockNaverOAuthResponse['response']> = {},
): MockNaverOAuthResponse {
	return {
		resultcode: '00',
		message: 'success',
		response: {
			id: 'naver_user_123456789',
			email: 'naveruser@naver.com',
			name: '테스트유저',
			nickname: '닉네임',
			...overrides,
		},
	};
}

export interface MockKakaoOAuthResponse {
	id: number;
	kakao_account?: {
		email?: string;
		profile?: {
			nickname?: string;
		};
	};
}

export function createMockKakaoOAuthResponse(
	overrides: Partial<MockKakaoOAuthResponse> = {},
): MockKakaoOAuthResponse {
	return {
		id: 1234567890,
		kakao_account: {
			email: 'kakaouser@kakao.com',
			profile: {
				nickname: '카카오유저',
			},
		},
		...overrides,
	};
}

/**
 * Firestore 문서 스냅샷 Mock 생성
 */
export function createMockDocumentSnapshot<T>(exists: boolean, data?: T) {
	return {
		exists,
		data: () => data,
		id: 'mock_doc_id',
		ref: {
			path: 'mock/path',
		},
	};
}

/**
 * 푸시 알림 페이로드 생성
 */
export interface MockPushNotificationPayload {
	to: string;
	title: string;
	body: string;
	data?: {
		url?: string;
	};
}

export function createMockPushNotificationPayload(
	overrides: Partial<MockPushNotificationPayload> = {},
): MockPushNotificationPayload {
	return {
		to: 'ExponentPushToken[test_token]',
		title: '📝 새로운 알림',
		body: '알림 내용입니다.',
		data: {
			url: 'animal-crossing-trading-app://home',
		},
		...overrides,
	};
}

/**
 * 삭제된 유저 데이터 생성
 */
export interface MockDeletedUser {
	providerId: string;
	deletedAt: {
		toDate: () => Date;
	};
	reason?: string;
}

export function createMockDeletedUser(
	overrides: Partial<Omit<MockDeletedUser, 'deletedAt'>> & {
		deletedAt?: Date;
	} = {},
): MockDeletedUser {
	const { deletedAt = new Date(), ...rest } = overrides;

	return {
		providerId: 'deleted_user_123',
		deletedAt: {
			toDate: () => deletedAt,
		},
		...rest,
	};
}
