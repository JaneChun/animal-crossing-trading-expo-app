import {
	getTrackingPermissionsAsync,
	isAvailable,
	PermissionStatus,
	requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';
import { AppState, Platform } from 'react-native';

// 실행 직후에는 앱이 active여도 팝업이 무시될 수 있어 잠시 기다린 뒤 요청한다
const REQUEST_DELAY_MS = 1000;
// 팝업 없이 undetermined로 끝나는 경우에 대비해 한 번 더 요청한다
const MAX_REQUEST_ATTEMPTS = 2;

const waitUntilActive = () =>
	new Promise<void>((resolve) => {
		if (AppState.currentState === 'active') {
			resolve();
			return;
		}

		const subscription = AppState.addEventListener('change', (nextState) => {
			if (nextState !== 'active') return;

			subscription.remove();
			resolve();
		});
	});

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * ATT 팝업은 앱이 active일 때만 표시되고, inactive 상태에서 요청하면 팝업 없이 undetermined로 끝난다.
 * 다른 시스템 권한 팝업(알림 등)이 떠 있어도 앱이 inactive가 되므로 이 함수가 끝난 뒤에 요청해야 한다.
 */
export const requestTrackingPermission = async (): Promise<void> => {
	if (Platform.OS !== 'ios' || !isAvailable()) return;

	try {
		// 이미 응답한 사용자는 기다리지 않는다
		const { status: currentStatus } = await getTrackingPermissionsAsync();
		if (currentStatus !== PermissionStatus.UNDETERMINED) return;

		for (let attempt = 1; attempt <= MAX_REQUEST_ATTEMPTS; attempt++) {
			await waitUntilActive();
			await delay(REQUEST_DELAY_MS);

			// 지연 중에 백그라운드로 갔다면 다시 active가 될 때까지 기다린다
			await waitUntilActive();

			const { status } = await requestTrackingPermissionsAsync();
			if (__DEV__) {
				console.log(`ATT permission status (attempt ${attempt}):`, status);
			}

			if (status !== PermissionStatus.UNDETERMINED) return;
		}
	} catch (error) {
		if (__DEV__) {
			console.warn('ATT permission request failed:', error);
		}
	}
};
