/**
 * 푸시 알림 탭(응답) 처리
 *
 * 알림을 탭했을 때의 화면 이동과 app_open 로깅을 이 파일에서 모두 정의한다.
 * 호출 위치: App.tsx(linking.getInitialURL), initializer.ts(응답 리스너), useAppLifecycle.ts(앱 실행 로깅)
 *
 * | 상황                         | 화면 이동                    | app_open 로깅                         |
 * |------------------------------|------------------------------|---------------------------------------|
 * | 콜드 스타트 (Android)        | getLaunchNotificationURL     | logLaunchAppOpen                      |
 * | 콜드 스타트 (iOS)            | getLaunchNotificationURL     | logLaunchAppOpen                      |
 * | 실행 중 탭 (포그라운드·백그라운드) | 응답 리스너                  | 응답 리스너                           |
 *
 * - Android: 콜드 스타트에서는 응답 리스너가 호출되지 않는다.
 * - iOS: 콜드 스타트 응답을 보관했다가 리스너 등록 시 다시 전달하므로, 리스너는 launch 응답을 건너뛴다.
 * - 시작 중에는 RootStackNavigator가 스플래시를 그려 화면이 등록되지 않으므로,
 *   콜드 스타트 이동을 리스너의 Linking.openURL로 처리하면 안 된다.
 */
import * as ExpoNotifications from 'expo-notifications';
import { Alert, Linking } from 'react-native';

import { logAppOpen } from '@/utilities/analytics';

// push_notification으로 앱이 열린 경우 background_resume 중복 로깅 방지 (useAppLifecycle에서 확인)
export const notificationOpenedApp = { current: false };

// 콜드 스타트 시 첫 화면 주소: 앱을 실행시킨 알림의 url (없으면 null)
export const getLaunchNotificationURL = (): string | null => {
	const lastResponse = ExpoNotifications.getLastNotificationResponse();
	const notificationUrl = lastResponse?.notification.request.content.data?.url;
	return typeof notificationUrl === 'string' ? notificationUrl : null;
};

// 앱 실행 시 1회 app_open 기록: 알림 탭으로 실행됐으면 push_notification, 아니면 cold_start
export const logLaunchAppOpen = () => {
	const response = ExpoNotifications.getLastNotificationResponse();
	logAppOpen(response ? 'push_notification' : 'cold_start');
};

// 실행 중 알림 탭 처리 리스너 등록 (반환값은 언마운트 시 remove)
export const addNotificationResponseHandler = () => {
	// launchResponseId: 앱 시작 시점의 마지막으로 탭한 알림 응답 ID
	// - 알림 탭으로 실행된 경우: 그 알림의 identifier
	// - 아이콘 탭 등 일반 실행인 경우: undefined
	const launchResponseId =
		ExpoNotifications.getLastNotificationResponse()?.notification.request.identifier;

	return ExpoNotifications.addNotificationResponseReceivedListener(async (response) => {
		// iOS가 다시 전달한 콜드 스타트 응답은 getLaunchNotificationURL·logLaunchAppOpen이 처리했으므로 건너뛴다
		if (response.notification.request.identifier === launchResponseId) return;

		notificationOpenedApp.current = true;
		logAppOpen('push_notification');

		const data = response.notification.request.content.data;
		const url = data?.url;
		if (!url) return;

		// Deep Link URL을 통해 앱 내 특정 화면으로 이동
		try {
			if (typeof url === 'string' && url.trim() !== '') {
				await Linking.openURL(url);
			} else {
				Alert.alert('유효하지 않은 URL', '유효하지 않은 URL입니다.');
			}
		} catch {
			Alert.alert('링크 열기 실패', '링크를 여는 도중 문제가 발생했습니다.');
		}
	});
};
