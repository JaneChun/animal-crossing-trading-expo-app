import * as ExpoNotifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { logAppOpen, logSessionEnd, notificationOpenedApp } from '@/utilities/analytics';

export const useAppLifecycle = () => {
	const appState = useRef<AppStateStatus>(AppState.currentState);
	const sessionStartRef = useRef<number>(Date.now());

	// 앱 실행 시 1회 app_open 기록: 알림 탭으로 실행됐으면 push_notification, 아니면 cold_start
	// 콜드 스타트 알림은 응답 리스너가 기록하지 않으므로 여기서 기록한다
	// (Android는 리스너가 호출되지 않고, iOS는 호출되지만 initializer.ts에서 건너뜀)
	useEffect(() => {
		const response = ExpoNotifications.getLastNotificationResponse();
		logAppOpen(response ? 'push_notification' : 'cold_start');
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
