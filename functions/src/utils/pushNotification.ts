import axios from 'axios';

export interface PushNotificationPayload {
	to: string; // 푸시 토큰
	title: string; // 알림 제목
	body: string; // 알림 내용
	data?: Record<string, string>; // 딥링크를 위한 추가 데이터 {url: string}
}

/**
 * Expo 푸시 서비스를 사용하여 푸시 알림 전송
 * @param payload - 알림 페이로드
 * @returns Promise<void>
 */
export async function sendPushNotification(
	payload: PushNotificationPayload,
): Promise<void> {
	try {
		await axios.post('https://exp.host/--/api/v2/push/send', payload, {
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (error) {
		console.error('푸시 알림 전송에 실패했습니다:', error);
		throw error;
	}
}
