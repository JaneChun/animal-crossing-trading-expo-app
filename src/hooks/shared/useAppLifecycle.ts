import * as ExpoNotifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { logAppOpen, logSessionEnd, notificationOpenedApp } from '@/utilities/analytics';

export const useAppLifecycle = () => {
	const appState = useRef<AppStateStatus>(AppState.currentState);
	const sessionStartRef = useRef<number>(Date.now());

	// cold start 로깅 — 푸시 알림 탭으로 열린 경우 중복 로깅 방지
	useEffect(() => {
		ExpoNotifications.getLastNotificationResponseAsync().then((response) => {
			if (!response) {
				logAppOpen('cold_start');
			}
			// push_notification은 addNotificationResponseReceivedListener에서 처리
		});
	}, []);

	useEffect(() => {
		const subscription = AppState.addEventListener('change', (nextState) => {
			const prev = appState.current;
			appState.current = nextState;

			// 백그라운드/비활성 → 활성 전환
			if (prev.match(/background|inactive/) && nextState === 'active') {
				sessionStartRef.current = Date.now();

				// 푸시 알림으로 열린게 아닐 때만 background_resume 로깅
				if (!notificationOpenedApp.current) {
					logAppOpen('background_resume');
				}
				notificationOpenedApp.current = false;

			// 앱이 백그라운드로 갈 때, 세션 시간 기록
			} else if (nextState === 'background') {
				const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
				logSessionEnd(duration);
			}
		});

		return () => subscription.remove();
	}, []);
};
