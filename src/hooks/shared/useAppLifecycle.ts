import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { logLaunchAppOpen, notificationOpenedApp } from '@/stores/push';
import { logAppOpen, logSessionEnd } from '@/utilities/analytics';

export const useAppLifecycle = () => {
	const appState = useRef<AppStateStatus>(AppState.currentState);
	const sessionStartRef = useRef<number>(Date.now());

	// 앱 실행 시 1회 app_open 기록 (흐름은 notificationResponse.ts 참조)
	useEffect(() => {
		logLaunchAppOpen();
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
