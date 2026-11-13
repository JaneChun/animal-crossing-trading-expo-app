/**
 * notification.ts 모듈 단위 테스트
 * 푸시 알림 관련 유틸리티 함수들을 테스트합니다
 */

import { createMockAxios } from '../helpers';

// axios 요청을 Mock으로 대체 - 공통 헬퍼 활용
jest.mock('axios', () => createMockAxios());

import axios from 'axios';
import {
	PushNotificationPayload,
	sendPushNotification,
} from '../../src/utils/pushNotification';

// 타입 안전성을 위해 명시적으로 Mock 타입으로 캐스팅
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('notification 유틸리티 함수 테스트', () => {
	describe('sendPushNotification 함수', () => {
		it('올바른 페이로드로 Expo API를 호출해야 한다', async () => {
			mockedAxios.post.mockResolvedValue({ data: { status: 'ok' } });

			// 테스트용 알림 데이터 준비
			const payload: PushNotificationPayload = {
				to: 'ExponentPushToken[test-token-123]',
				title: '💬 새로운 채팅 메세지가 왔어구리!',
				body: '철광석 교환 가능하신가요?',
				data: {
					url: 'animal-crossing-trading-app://chat/room123',
				},
			};

			await sendPushNotification(payload);

			/**
			 * Mock 함수 호출 검증 방법들:
			 */

			// 1. toHaveBeenCalled: mock 함수가 호출되었는지 확인
			expect(mockedAxios.post).toHaveBeenCalled();

			// 2. toHaveBeenCalledWith: mock 함수가 특정 인자로 호출되었는지 확인
			expect(mockedAxios.post).toHaveBeenCalledWith(
				'https://exp.host/--/api/v2/push/send', // 첫 번째 인자: URL
				{ ...payload, channelId: 'default' }, // 두 번째 인자: 요청 본문 (Android 채널 지정 포함)
				{
					// 세 번째 인자: 설정 객체
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);

			// 3. toHaveBeenCalledTimes: mock 함수가 몇 번 호출되었는지 확인
			expect(mockedAxios.post).toHaveBeenCalledTimes(1);
		});

		it('API 호출이 실패하면 에러를 throw해야 한다', async () => {
			const apiError = new Error('Network error');
			mockedAxios.post.mockRejectedValue(apiError);

			const payload: PushNotificationPayload = {
				to: 'invalid-token',
				title: '테스트',
				body: '테스트 메시지',
			};

			/**
			 * 비동기 함수의 에러 테스트:
			 * rejects.toThrow: async 함수가 에러를 throw하는지 확인
			 * async 함수의 경우 rejects를 사용해야 함 (동기 함수는 그냥 toThrow)
			 */
			await expect(sendPushNotification(payload)).rejects.toThrow(
				'Network error',
			);

			// 여전히 API가 호출되었는지 확인 (실패했지만 시도는 했어야 함)
			expect(mockedAxios.post).toHaveBeenCalled();
		});

		/**
		 * 실제 모동숲 마켓 앱에서 사용되는 알림 시나리오 테스트
		 */
		it('댓글 알림 시나리오를 처리해야 한다', async () => {
			mockedAxios.post.mockResolvedValue({ data: { status: 'ok' } });

			const payload: PushNotificationPayload = {
				to: 'ExponentPushToken[user123]',
				title: '📝 새로운 댓글이 달렸어구리!',
				body: '[철광석 교환] 저도 관심있어요!',
				data: {
					url: 'animal-crossing-trading-app://post/Boards/post123/notification456',
				},
			};

			await sendPushNotification(payload);

			expect(mockedAxios.post).toHaveBeenCalledWith(
				'https://exp.host/--/api/v2/push/send',
				{ ...payload, channelId: 'default' },
				{
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);
		});

		it('채팅 알림 시나리오를 처리해야 한다', async () => {
			mockedAxios.post.mockResolvedValue({ data: { status: 'ok' } });

			const payload: PushNotificationPayload = {
				to: 'ExponentPushToken[trader456]',
				title: '💬 새로운 채팅 메세지가 왔어구리!',
				body: '여울: 거래 언제 하실래요?',
				data: {
					url: 'animal-crossing-trading-app://chat/chat789',
				},
			};

			await sendPushNotification(payload);

			expect(mockedAxios.post).toHaveBeenCalledWith(
				'https://exp.host/--/api/v2/push/send',
				{ ...payload, channelId: 'default' },
				{
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);
		});

		it('data 필드가 없어도 정상 동작해야 한다', async () => {
			mockedAxios.post.mockResolvedValue({ data: { status: 'ok' } });

			// data 필드가 없는 페이로드
			const payload: PushNotificationPayload = {
				to: 'ExponentPushToken[test]',
				title: '간단한 알림',
				body: '데이터 없는 알림입니다',
			};

			await sendPushNotification(payload);

			expect(mockedAxios.post).toHaveBeenCalledWith(
				'https://exp.host/--/api/v2/push/send',
				{ ...payload, channelId: 'default' },
				{
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);
		});

		/**
		 * HTTP 상태 코드별 에러 처리 테스트
		 */
		it('Expo API가 400 Bad Request를 반환하면 적절히 처리해야 한다', async () => {
			const badRequestError = {
				response: {
					status: 400,
					data: {
						errors: [
							{
								code: 'INVALID_CREDENTIALS',
								message: 'Invalid push token',
							},
						],
					},
				},
			};

			mockedAxios.post.mockRejectedValue(badRequestError);

			const payload: PushNotificationPayload = {
				to: 'invalid-token-format',
				title: '테스트',
				body: '잘못된 토큰 테스트',
			};

			await expect(sendPushNotification(payload)).rejects.toEqual(
				badRequestError,
			);
		});
	});
});
