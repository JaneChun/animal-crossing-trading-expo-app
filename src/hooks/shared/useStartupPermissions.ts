import { useEffect } from 'react';
import mobileAds from 'react-native-google-mobile-ads';

import { fetchAdConfig } from '@/firebase/services/adService';
import { useAdStore } from '@/stores/ads';
import { usePushNotificationStore } from '@/stores/push';
import { enableAnalyticsCollection } from '@/utilities/analytics';
import { registerForPushNotificationsAsync } from '@/utilities/registerForPushNotificationsAsync';
import { requestTrackingPermission } from '@/utilities/trackingPermission';

const initializeAds = async () => {
	try {
		await mobileAds().initialize();

		if (__DEV__) {
			console.log('AdMob SDK initialized');
		}
	} catch (error) {
		if (__DEV__) {
			console.warn('AdMob initialization failed:', error);
		}
	}

	// 광고 설정이 반영되면 홈 목록이 네이티브 광고를 요청하므로 AdMob 초기화 뒤에 반영한다
	const adConfig = await fetchAdConfig();
	useAdStore.getState().setAdConfig(adConfig);
};

/**
 * 실행 초기의 권한 요청과 추적 관련 SDK 초기화 순서를 이 훅에서만 관리한다.
 * - ATT 응답 전에는 추적 데이터를 수집하면 안 되므로 Analytics·AdMob·광고 설정 반영은 ATT 이후에 한다.
 * - 시스템 권한 팝업이 동시에 요청되면 ATT 팝업이 표시되지 않으므로 알림 권한은 ATT 이후에 요청한다.
 */
export const useStartupPermissions = () => {
	useEffect(() => {
		const { setExpoPushToken, setError } = usePushNotificationStore.getState();

		const registerPushToken = async () => {
			try {
				const pushToken = await registerForPushNotificationsAsync();
				setExpoPushToken(pushToken ?? null);
			} catch (error) {
				setError(error as Error);
			}
		};

		const run = async () => {
			await requestTrackingPermission();
			enableAnalyticsCollection();

			// 알림 권한 요청이 AdMob 초기화 시간만큼 늦어지지 않도록 병렬로 진행한다
			await Promise.all([initializeAds(), registerPushToken()]);
		};

		run();
	}, []);
};
