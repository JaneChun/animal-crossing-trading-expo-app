/**
 * chat.ts 모듈 단위 테스트
 * 채팅 알림 처리 함수를 테스트합니다
 */

// Firebase Functions Mock 설정 - HttpsError 생성을 위한 Mock
const MockHttpsError = jest
	.fn()
	.mockImplementation((code, message, details) => {
		// 실제 Error 객체를 기반으로 Https에러를 시뮬레이션
		const error = new Error(message);
		error.name = 'HttpsError';
		(error as any).code = code;
		(error as any).details = details;
		// instanceof 검사를 위해 constructor 설정
		Object.setPrototypeOf(error, MockHttpsError.prototype);
		return error;
	});

jest.mock('firebase-functions', () => ({
	https: {
		HttpsError: MockHttpsError,
		onCall: jest.fn(),
	},
}));

// Firebase Firestore Mock 설정
const mockGet = jest.fn();
const mockUpdate = jest.fn();
const mockDoc = jest.fn().mockReturnValue({
	get: mockGet,
	update: mockUpdate,
});
const mockCollection = jest.fn().mockReturnValue({
	doc: mockDoc,
});

// 유틸리티 함수들 Mock 설정
const mockGetSafeUid = jest.fn();
const mockTruncateText = jest.fn();

jest.mock('../../src/utils/common', () => ({
	db: {
		collection: mockCollection,
		doc: mockDoc,
	},
	getSafeUid: mockGetSafeUid,
	truncateText: mockTruncateText,
}));

// Push notification Mock 설정
const mockSendPushNotification = jest.fn();
jest.mock('../../src/utils/pushNotification', () => ({
	sendPushNotification: mockSendPushNotification,
}));

// Firebase FieldValue Mock 설정
const mockIncrement = jest.fn();
const mockArrayUnion = jest.fn();
const mockTimestamp = { seconds: 1640995200, nanoseconds: 0 };
jest.mock('firebase-admin/firestore', () => ({
	FieldValue: {
		increment: mockIncrement,
		arrayUnion: mockArrayUnion,
	},
	Timestamp: {
		now: jest.fn().mockReturnValue(mockTimestamp),
	},
}));

import { handleChatMessageCreated } from '../../src/notifications/chat';

describe('채팅 알림 처리 테스트', () => {
	const chatId = 'test_chat_room_123';
	const validMessage = {
		receiverId: 'receiver_user_456',
		senderId: 'sender_user_789',
		body: '안녕하세요! 거래 문의드려요.',
	};

	beforeEach(() => {
		jest.clearAllMocks();

		// console.warn, console.error 무시
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});

		// 기본 Mock 설정
		mockGetSafeUid.mockImplementation((uid) => uid.replace(/\./g, ''));
		mockTruncateText.mockImplementation((text, maxLength) =>
			text.length <= maxLength ? text : text.substring(0, maxLength) + '...',
		);
		mockIncrement.mockReturnValue('INCREMENT_PLACEHOLDER');
		mockArrayUnion.mockReturnValue('ARRAY_UNION_PLACEHOLDER');
	});

	describe('handleChatMessageCreated 함수', () => {
		describe('성공 케이스', () => {
			it('정상 메시지를 처리하고 채팅방 업데이트와 푸시 알림을 전송해야 한다', async () => {
				/**
				 * 정상적인 채팅 메시지 처리 시나리오:
				 * 1. 채팅방 정보 업데이트 (최근 메시지, 읽지 않은 수, 가시성)
				 * 2. 사용자 정보 조회 (수신자, 발신자)
				 * 3. 푸시 알림 전송 (수신자가 활성 상태가 아닐 때)
				 */
				const receiverData = {
					pushToken: 'expo_push_token_456',
					activeChatRoomId: null, // 다른 채팅방에 있거나 없음
					displayName: '수신자닉네임',
				};

				const senderData = {
					displayName: '발신자닉네임',
				};

				// Mock 사용자 정보 설정
				mockGet
					.mockResolvedValueOnce({
						// receiver info
						exists: true,
						data: () => receiverData,
					})
					.mockResolvedValueOnce({
						// sender info
						exists: true,
						data: () => senderData,
					});

				await handleChatMessageCreated(chatId, validMessage);

				/**
				 * 채팅방 업데이트 검증:
				 * 1. 올바른 채팅방 ID로 컬렉션 접근
				 * 2. 필요한 필드들이 올바르게 업데이트되었는지 확인
				 */
				expect(mockCollection).toHaveBeenCalledWith('Chats');
				expect(mockDoc).toHaveBeenCalledWith(chatId);
				expect(mockUpdate).toHaveBeenCalledWith({
					lastMessage: validMessage.body,
					lastMessageSenderId: validMessage.senderId,
					updatedAt: mockTimestamp,
					[`unreadCount.${validMessage.receiverId}`]: 'INCREMENT_PLACEHOLDER',
					visibleTo: 'ARRAY_UNION_PLACEHOLDER',
				});

				/**
				 * 사용자 정보 조회 검증:
				 * 1. 수신자와 발신자 정보를 병렬로 조회
				 * 2. 올바른 사용자 ID로 접근
				 */
				expect(mockDoc).toHaveBeenCalledWith(
					`Users/${validMessage.receiverId}`,
				);
				expect(mockDoc).toHaveBeenCalledWith(`Users/${validMessage.senderId}`);
				expect(mockGet).toHaveBeenCalledTimes(2);

				/**
				 * 푸시 알림 전송 검증:
				 * 1. 올바른 푸시 토큰으로 전송
				 * 2. 한국어 알림 제목과 발신자 정보 포함
				 * 3. 메시지 본문 truncation 적용
				 * 4. Deep Link URL 포함
				 */
				expect(mockSendPushNotification).toHaveBeenCalledWith({
					to: 'expo_push_token_456',
					title: '💬 새로운 채팅 메세지가 왔어구리!',
					body: `${senderData.displayName}: ${validMessage.body}`,
					data: {
						url: `animal-crossing-trading-app://chat/${chatId}`,
					},
				});

				// 유틸리티 함수들 호출 검증
				expect(mockGetSafeUid).toHaveBeenCalledWith(validMessage.receiverId);
				expect(mockTruncateText).toHaveBeenCalledWith(validMessage.body, 50);
				expect(mockIncrement).toHaveBeenCalledWith(1);
				expect(mockArrayUnion).toHaveBeenCalledWith(validMessage.receiverId);
			});

			it('긴 메시지는 50자로 truncate되어 푸시 알림에 포함되어야 한다', async () => {
				const longMessage = {
					...validMessage,
					body: '이것은 매우 긴 메시지입니다. 50자를 초과하여 truncate되어야 합니다. 더 많은 내용을 포함하여 테스트해보겠습니다.',
				};

				const receiverData = {
					pushToken: 'expo_push_token_456',
					activeChatRoomId: null,
					displayName: '수신자닉네임',
				};

				const senderData = {
					displayName: '발신자닉네임',
				};

				mockGet
					.mockResolvedValueOnce({ exists: true, data: () => receiverData })
					.mockResolvedValueOnce({ exists: true, data: () => senderData });

				await handleChatMessageCreated(chatId, longMessage);

				// truncateText 함수가 올바른 매개변수로 호출되었는지 확인
				expect(mockTruncateText).toHaveBeenCalledWith(longMessage.body, 50);

				// 실제 truncation이 적용된 결과 검증
				const truncatedBody = longMessage.body.substring(0, 50) + '...';
				expect(mockSendPushNotification).toHaveBeenCalledWith({
					to: 'expo_push_token_456',
					title: '💬 새로운 채팅 메세지가 왔어구리!',
					body: `${senderData.displayName}: ${truncatedBody}`,
					data: {
						url: `animal-crossing-trading-app://chat/${chatId}`,
					},
				});
			});
		});

		describe('필터링 케이스', () => {
			it('활성 채팅방에 있는 사용자에게는 푸시 알림을 보내지 않아야 한다', async () => {
				/**
				 * 사용자가 현재 채팅방에 활성 상태인 경우:
				 * 1. 채팅방 정보는 업데이트
				 * 2. 푸시 알림은 전송하지 않음
				 */
				const receiverData = {
					pushToken: 'expo_push_token_456',
					activeChatRoomId: chatId, // 현재 채팅방에 활성 상태
					displayName: '수신자닉네임',
				};

				const senderData = {
					displayName: '발신자닉네임',
				};

				mockGet
					.mockResolvedValueOnce({ exists: true, data: () => receiverData })
					.mockResolvedValueOnce({ exists: true, data: () => senderData });

				await handleChatMessageCreated(chatId, validMessage);

				// 채팅방 업데이트는 정상적으로 실행
				expect(mockUpdate).toHaveBeenCalled();

				// 푸시 알림은 전송되지 않음
				expect(mockSendPushNotification).not.toHaveBeenCalled();
			});

			it('푸시 토큰이 없는 사용자에게는 푸시 알림을 보내지 않아야 한다', async () => {
				const receiverData = {
					pushToken: null, // 푸시 토큰 없음
					activeChatRoomId: null,
					displayName: '수신자닉네임',
				};

				const senderData = {
					displayName: '발신자닉네임',
				};

				mockGet
					.mockResolvedValueOnce({ exists: true, data: () => receiverData })
					.mockResolvedValueOnce({ exists: true, data: () => senderData });

				await handleChatMessageCreated(chatId, validMessage);

				// 채팅방 업데이트는 정상적으로 실행
				expect(mockUpdate).toHaveBeenCalled();

				// 푸시 알림은 전송되지 않음
				expect(mockSendPushNotification).not.toHaveBeenCalled();
			});

			it('시스템 메시지는 처리하지 않아야 한다', async () => {
				const systemMessage = {
					...validMessage,
					senderId: 'system',
				};

				await handleChatMessageCreated(chatId, systemMessage);

				// 어떤 처리도 일어나지 않았는지 확인
				expect(mockUpdate).not.toHaveBeenCalled();
				expect(mockGet).not.toHaveBeenCalled();
				expect(mockSendPushNotification).not.toHaveBeenCalled();
			});

			it('리뷰 메시지는 처리하지 않아야 한다', async () => {
				const reviewMessage = {
					...validMessage,
					senderId: 'review',
				};

				await handleChatMessageCreated(chatId, reviewMessage);

				// 어떤 처리도 일어나지 않았는지 확인
				expect(mockUpdate).not.toHaveBeenCalled();
				expect(mockGet).not.toHaveBeenCalled();
				expect(mockSendPushNotification).not.toHaveBeenCalled();
			});

			it('senderId가 없는 메시지는 처리하지 않아야 한다', async () => {
				const messageWithoutSender = {
					...validMessage,
					senderId: '',
				};

				await handleChatMessageCreated(chatId, messageWithoutSender);

				expect(mockUpdate).not.toHaveBeenCalled();
				expect(mockGet).not.toHaveBeenCalled();
				expect(mockSendPushNotification).not.toHaveBeenCalled();
			});

			it('receiverId가 없는 메시지는 처리하지 않아야 한다', async () => {
				const messageWithoutReceiver = {
					...validMessage,
					receiverId: '',
				};

				await handleChatMessageCreated(chatId, messageWithoutReceiver);

				expect(mockUpdate).not.toHaveBeenCalled();
				expect(mockGet).not.toHaveBeenCalled();
				expect(mockSendPushNotification).not.toHaveBeenCalled();
			});

			it('body가 없는 메시지는 처리하지 않아야 한다', async () => {
				const messageWithoutBody = {
					...validMessage,
					body: '',
				};

				await handleChatMessageCreated(chatId, messageWithoutBody);

				expect(mockUpdate).not.toHaveBeenCalled();
				expect(mockGet).not.toHaveBeenCalled();
				expect(mockSendPushNotification).not.toHaveBeenCalled();
			});
		});

		describe('에러 처리 케이스', () => {
			it('채팅방 업데이트 실패 시 에러를 로그하고 계속 진행해야 한다', async () => {
				const consoleErrorSpy = jest
					.spyOn(console, 'error')
					.mockImplementation(() => {});

				// 채팅방 업데이트 실패 시뮬레이션
				mockUpdate.mockRejectedValue(new Error('Firestore update failed'));

				const receiverData = {
					pushToken: 'expo_push_token_456',
					activeChatRoomId: null,
					displayName: '수신자닉네임',
				};

				const senderData = {
					displayName: '발신자닉네임',
				};

				mockGet
					.mockResolvedValueOnce({ exists: true, data: () => receiverData })
					.mockResolvedValueOnce({ exists: true, data: () => senderData });

				// 함수가 에러를 throw하지 않고 정상 완료되어야 함
				await expect(
					handleChatMessageCreated(chatId, validMessage),
				).resolves.not.toThrow();

				// 채팅방 업데이트 실패 에러가 로그되었는지 확인
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					'채팅방 정보 업데이트 실패',
					expect.any(Error),
				);

				consoleErrorSpy.mockRestore();
			});

			it('푸시 알림 전송 실패 시 에러를 로그하고 계속 진행해야 한다', async () => {
				const consoleErrorSpy = jest
					.spyOn(console, 'error')
					.mockImplementation(() => {});

				const receiverData = {
					pushToken: 'expo_push_token_456',
					activeChatRoomId: null,
					displayName: '수신자닉네임',
				};

				const senderData = {
					displayName: '발신자닉네임',
				};

				mockGet
					.mockResolvedValueOnce({ exists: true, data: () => receiverData })
					.mockResolvedValueOnce({ exists: true, data: () => senderData });

				// 푸시 알림 전송 실패 시뮬레이션
				mockSendPushNotification.mockRejectedValue(
					new Error('Push notification failed'),
				);

				// 함수가 에러를 throw하지 않고 정상 완료되어야 함
				await expect(
					handleChatMessageCreated(chatId, validMessage),
				).resolves.not.toThrow();

				// 에러가 로그되었는지 확인
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					'채팅 알림 처리 중 오류가 발생했습니다:',
					expect.any(Error),
				);

				consoleErrorSpy.mockRestore();
			});

			it('사용자 정보 조회 실패 시 에러를 로그하고 계속 진행해야 한다', async () => {
				const consoleErrorSpy = jest
					.spyOn(console, 'error')
					.mockImplementation(() => {});

				// 사용자 정보 조회 실패 시뮬레이션
				mockGet.mockRejectedValue(new Error('User not found'));

				// 함수가 에러를 throw하지 않고 정상 완료되어야 함
				await expect(
					handleChatMessageCreated(chatId, validMessage),
				).resolves.not.toThrow();

				// 에러가 로그되었는지 확인
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					'채팅 알림 처리 중 오류가 발생했습니다:',
					expect.any(Error),
				);

				consoleErrorSpy.mockRestore();
			});
		});

		describe('경계 케이스', () => {
			it('발신자 displayName이 없는 경우 undefined로 처리해야 한다', async () => {
				const receiverData = {
					pushToken: 'expo_push_token_456',
					activeChatRoomId: null,
					displayName: '수신자닉네임',
				};

				const senderData = {
					// displayName이 없는 경우
				};

				mockGet
					.mockResolvedValueOnce({ exists: true, data: () => receiverData })
					.mockResolvedValueOnce({ exists: true, data: () => senderData });

				await handleChatMessageCreated(chatId, validMessage);

				// undefined displayName으로 푸시 알림 전송
				expect(mockSendPushNotification).toHaveBeenCalledWith({
					to: 'expo_push_token_456',
					title: '💬 새로운 채팅 메세지가 왔어구리!',
					body: `undefined: ${validMessage.body}`,
					data: {
						url: `animal-crossing-trading-app://chat/${chatId}`,
					},
				});
			});
		});
	});
});
