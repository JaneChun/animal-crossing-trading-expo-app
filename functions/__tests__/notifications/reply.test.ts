/**
 * reply.ts 모듈 단위 테스트
 * 답글 알림 처리 함수를 테스트합니다
 */

import {
	createMockFirestoreChain,
	createMockTruncateText,
	createMockPushNotification,
} from '../helpers';

// Firestore Mock 설정 - 공통 헬퍼 활용
const firestoreMock = createMockFirestoreChain();
const { mockGet, mockDoc } = firestoreMock;

// 유틸리티 함수들 Mock 설정
const mockTruncateText = createMockTruncateText();

jest.mock('../../src/utils/common', () => ({
	db: {
		doc: mockDoc,
	},
	truncateText: mockTruncateText,
}));

// Push notification Mock 설정 - 공통 헬퍼 활용
const { mockSendPushNotification } = createMockPushNotification();
jest.mock('../../src/utils/pushNotification', () => ({
	sendPushNotification: mockSendPushNotification,
}));

import { handleReplyNotification } from '../../src/notifications/reply';

describe('답글 알림 처리 테스트', () => {
	const notificationId = 'notification_123';
	const validBoardsNotification = {
		receiverId: 'receiver_user_456',
		senderId: 'sender_user_789',
		type: 'Boards' as const,
		postId: 'board_post_123',
		body: '원댓글에 대한 답글입니다!',
	};

	const validCommunitiesNotification = {
		receiverId: 'receiver_user_456',
		senderId: 'sender_user_789',
		type: 'Communities' as const,
		postId: 'community_post_456',
		body: '저도 같은 생각이에요!',
	};

	describe('handleReplyNotification 함수', () => {
		describe('성공 케이스 - Boards 타입', () => {
			it('Boards 게시글 답글 알림을 성공적으로 전송해야 한다', async () => {
				/**
				 * Boards 타입 답글 알림 전송 시나리오:
				 * 1. 수신자 정보 조회
				 * 2. 게시글 정보 조회 (Boards 컬렉션)
				 * 3. 제목 truncation 적용
				 * 4. 푸시 알림 전송
				 */
				const receiverData = {
					pushToken: 'expo_push_token_456',
					displayName: '수신자닉네임',
				};

				const postData = {
					title: '닌텐도 스위치 동물의 숲 아이템 판매',
					body: '게시글 내용입니다.',
				};

				mockGet
					.mockResolvedValueOnce({
						// receiver info
						exists: true,
						data: () => receiverData,
					})
					.mockResolvedValueOnce({
						// post info
						exists: true,
						data: () => postData,
					});

				await handleReplyNotification(validBoardsNotification, notificationId);

				/**
				 * 사용자 및 게시글 정보 조회 검증:
				 * 1. 수신자 정보 조회
				 * 2. Boards 컬렉션에서 게시글 정보 조회
				 */
				expect(mockDoc).toHaveBeenCalledWith(
					`Users/${validBoardsNotification.receiverId}`,
				);
				expect(mockDoc).toHaveBeenCalledWith(
					`${validBoardsNotification.type}/${validBoardsNotification.postId}`,
				);
				expect(mockGet).toHaveBeenCalledTimes(2);

				/**
				 * 푸시 알림 전송 검증:
				 * 1. 올바른 푸시 토큰으로 전송
				 * 2. 한국어 알림 제목 (댓글과 다른 메시지)
				 * 3. 게시글 제목 + 답글 내용 포함
				 * 4. Deep Link URL 포함
				 */
				expect(mockSendPushNotification).toHaveBeenCalledWith({
					to: 'expo_push_token_456',
					title: '💬 새로운 답글이 달렸어구리!',
					body: `[닌텐도 스...] ${validBoardsNotification.body}`,
					data: {
						url: `animal-crossing-trading-app://post/${validBoardsNotification.type}/${validBoardsNotification.postId}/${notificationId}`,
					},
				});

				// 유틸리티 함수 호출 검증
				expect(mockTruncateText).toHaveBeenCalledWith(
					validBoardsNotification.body,
					50,
				);
			});

			it('긴 게시글 제목은 5자로 truncate되어야 한다', async () => {
				const receiverData = {
					pushToken: 'expo_push_token_456',
					displayName: '수신자닉네임',
				};

				const postData = {
					title: '이것은 매우 긴 게시글 제목입니다. 5자를 초과합니다.',
					body: '게시글 내용입니다.',
				};

				mockGet
					.mockResolvedValueOnce({ exists: true, data: () => receiverData })
					.mockResolvedValueOnce({ exists: true, data: () => postData });

				await handleReplyNotification(validBoardsNotification, notificationId);

				// 제목이 5자로 truncate되고 말줄임표가 추가되었는지 확인
				expect(mockSendPushNotification).toHaveBeenCalledWith({
					to: 'expo_push_token_456',
					title: '💬 새로운 답글이 달렸어구리!',
					body: `[이것은 매...] ${validBoardsNotification.body}`,
					data: {
						url: `animal-crossing-trading-app://post/${validBoardsNotification.type}/${validBoardsNotification.postId}/${notificationId}`,
					},
				});
			});

			it('짧은 게시글 제목은 그대로 유지되어야 한다', async () => {
				const receiverData = {
					pushToken: 'expo_push_token_456',
					displayName: '수신자닉네임',
				};

				const postData = {
					title: '교환',
					body: '게시글 내용입니다.',
				};

				mockGet
					.mockResolvedValueOnce({ exists: true, data: () => receiverData })
					.mockResolvedValueOnce({ exists: true, data: () => postData });

				await handleReplyNotification(validBoardsNotification, notificationId);

				// 5자 이하 제목은 그대로 유지
				expect(mockSendPushNotification).toHaveBeenCalledWith({
					to: 'expo_push_token_456',
					title: '💬 새로운 답글이 달렸어구리!',
					body: `[교환] ${validBoardsNotification.body}`,
					data: {
						url: `animal-crossing-trading-app://post/${validBoardsNotification.type}/${validBoardsNotification.postId}/${notificationId}`,
					},
				});
			});
		});

		describe('성공 케이스 - Communities 타입', () => {
			it('Communities 게시글 답글 알림을 성공적으로 전송해야 한다', async () => {
				const receiverData = {
					pushToken: 'expo_push_token_456',
					displayName: '수신자닉네임',
				};

				const postData = {
					title: '커뮤니티 질문',
					body: '커뮤니티 게시글 내용입니다.',
				};

				mockGet
					.mockResolvedValueOnce({ exists: true, data: () => receiverData })
					.mockResolvedValueOnce({ exists: true, data: () => postData });

				await handleReplyNotification(
					validCommunitiesNotification,
					notificationId,
				);

				expect(mockDoc).toHaveBeenCalledWith(
					`Users/${validCommunitiesNotification.receiverId}`,
				);
				expect(mockDoc).toHaveBeenCalledWith(
					`${validCommunitiesNotification.type}/${validCommunitiesNotification.postId}`,
				);

				expect(mockSendPushNotification).toHaveBeenCalledWith({
					to: 'expo_push_token_456',
					title: '💬 새로운 답글이 달렸어구리!',
					body: `[커뮤니티 ...] ${validCommunitiesNotification.body}`,
					data: {
						url: `animal-crossing-trading-app://post/${validCommunitiesNotification.type}/${validCommunitiesNotification.postId}/${notificationId}`,
					},
				});
			});

			it('긴 답글 내용은 50자로 truncate되어야 한다', async () => {
				const longReplyNotification = {
					...validCommunitiesNotification,
					body: '이것은 매우 긴 답글 내용입니다. 50자를 초과하여 truncate되어야 합니다. 더 많은 내용을 포함하여 테스트해보겠습니다.',
				};

				const receiverData = {
					pushToken: 'expo_push_token_456',
					displayName: '수신자닉네임',
				};

				const postData = {
					title: '커뮤니티 질문',
					body: '커뮤니티 게시글 내용입니다.',
				};

				mockGet
					.mockResolvedValueOnce({ exists: true, data: () => receiverData })
					.mockResolvedValueOnce({ exists: true, data: () => postData });

				await handleReplyNotification(longReplyNotification, notificationId);

				// truncateText 함수가 올바른 매개변수로 호출되었는지 확인
				expect(mockTruncateText).toHaveBeenCalledWith(
					longReplyNotification.body,
					50,
				);
			});
		});

		describe('필터링 케이스', () => {
			it('푸시 토큰이 없는 사용자에게는 푸시 알림을 보내지 않아야 한다', async () => {
				const receiverData = {
					pushToken: null,
					displayName: '수신자닉네임',
				};

				const postData = {
					title: '게시글 제목',
					body: '게시글 내용입니다.',
				};

				mockGet
					.mockResolvedValueOnce({ exists: true, data: () => receiverData })
					.mockResolvedValueOnce({ exists: true, data: () => postData });

				await handleReplyNotification(validBoardsNotification, notificationId);

				expect(mockGet).toHaveBeenCalledTimes(2);
				expect(mockSendPushNotification).not.toHaveBeenCalled();
			});

			it('senderId가 없는 알림은 처리하지 않아야 한다', async () => {
				const invalidNotification = {
					...validBoardsNotification,
					senderId: '',
				};

				await handleReplyNotification(invalidNotification, notificationId);

				expect(mockGet).not.toHaveBeenCalled();
				expect(mockSendPushNotification).not.toHaveBeenCalled();
			});

			it('receiverId가 없는 알림은 처리하지 않아야 한다', async () => {
				const invalidNotification = {
					...validBoardsNotification,
					receiverId: '',
				};

				await handleReplyNotification(invalidNotification, notificationId);

				expect(mockGet).not.toHaveBeenCalled();
				expect(mockSendPushNotification).not.toHaveBeenCalled();
			});

			it('body가 없는 답글은 처리하지 않아야 한다', async () => {
				const invalidNotification = {
					...validBoardsNotification,
					body: '',
				};

				await handleReplyNotification(invalidNotification, notificationId);

				expect(mockGet).not.toHaveBeenCalled();
				expect(mockSendPushNotification).not.toHaveBeenCalled();
			});
		});

		describe('데이터 무결성 케이스', () => {
			it('존재하지 않는 수신자의 경우 알림을 보내지 않아야 한다', async () => {
				const postData = {
					title: '게시글 제목',
					body: '게시글 내용입니다.',
				};

				mockGet
					.mockResolvedValueOnce({ exists: false })
					.mockResolvedValueOnce({ exists: true, data: () => postData });

				await handleReplyNotification(validBoardsNotification, notificationId);

				expect(mockGet).toHaveBeenCalledTimes(2);
				expect(mockSendPushNotification).not.toHaveBeenCalled();
			});

			it('존재하지 않는 게시글의 경우 알림을 보내지 않아야 한다', async () => {
				const receiverData = {
					pushToken: 'expo_push_token_456',
					displayName: '수신자닉네임',
				};

				mockGet
					.mockResolvedValueOnce({ exists: true, data: () => receiverData })
					.mockResolvedValueOnce({ exists: false });

				await handleReplyNotification(validBoardsNotification, notificationId);

				expect(mockGet).toHaveBeenCalledTimes(2);
				expect(mockSendPushNotification).not.toHaveBeenCalled();
			});

			it('게시글 제목이 없는 경우 빈 문자열로 처리해야 한다', async () => {
				const receiverData = {
					pushToken: 'expo_push_token_456',
					displayName: '수신자닉네임',
				};

				const postData = {
					// title 없음
					body: '게시글 내용입니다.',
				};

				mockGet
					.mockResolvedValueOnce({ exists: true, data: () => receiverData })
					.mockResolvedValueOnce({ exists: true, data: () => postData });

				await handleReplyNotification(validBoardsNotification, notificationId);

				// 제목이 없으면 빈 문자열로 처리
				expect(mockSendPushNotification).toHaveBeenCalledWith({
					to: 'expo_push_token_456',
					title: '💬 새로운 답글이 달렸어구리!',
					body: `[] ${validBoardsNotification.body}`,
					data: {
						url: `animal-crossing-trading-app://post/${validBoardsNotification.type}/${validBoardsNotification.postId}/${notificationId}`,
					},
				});
			});
		});

		describe('에러 처리 케이스', () => {
			it('사용자 정보 조회 실패 시 에러를 로그하고 계속 진행해야 한다', async () => {
				const consoleErrorSpy = jest
					.spyOn(console, 'error')
					.mockImplementation(() => {});

				mockGet.mockRejectedValue(new Error('User not found'));

				await expect(
					handleReplyNotification(validBoardsNotification, notificationId),
				).resolves.not.toThrow();

				expect(consoleErrorSpy).toHaveBeenCalledWith(
					'Reply notification failed:',
					expect.any(Error),
				);

				consoleErrorSpy.mockRestore();
			});

			it('게시글 정보 조회 실패 시 에러를 로그하고 계속 진행해야 한다', async () => {
				const consoleErrorSpy = jest
					.spyOn(console, 'error')
					.mockImplementation(() => {});

				const receiverData = {
					pushToken: 'expo_push_token_456',
					displayName: '수신자닉네임',
				};

				mockGet
					.mockResolvedValueOnce({ exists: true, data: () => receiverData })
					.mockRejectedValueOnce(new Error('Post not found'));

				await expect(
					handleReplyNotification(validBoardsNotification, notificationId),
				).resolves.not.toThrow();

				expect(consoleErrorSpy).toHaveBeenCalledWith(
					'Reply notification failed:',
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
					displayName: '수신자닉네임',
				};

				const postData = {
					title: '게시글 제목',
					body: '게시글 내용입니다.',
				};

				mockGet
					.mockResolvedValueOnce({ exists: true, data: () => receiverData })
					.mockResolvedValueOnce({ exists: true, data: () => postData });

				mockSendPushNotification.mockRejectedValue(
					new Error('Push notification failed'),
				);

				await expect(
					handleReplyNotification(validBoardsNotification, notificationId),
				).resolves.not.toThrow();

				expect(consoleErrorSpy).toHaveBeenCalledWith(
					'Reply notification failed:',
					expect.any(Error),
				);

				consoleErrorSpy.mockRestore();
			});
		});
	});
});
