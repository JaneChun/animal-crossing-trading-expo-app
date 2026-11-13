import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { showToast } from '@/components/ui/Toast';

export async function registerForPushNotificationsAsync() {
	if (!Device.isDevice) {
		showToast(
			'error',
			'푸시 알림 권한이 없습니다.\n실제 기기에서만 푸시 알림을 받을 수 있습니다.',
		);

		return null;
	}

	// Android 13 이상은 알림 채널이 하나도 없으면 권한 팝업이 뜨지 않으므로 권한 확인 전에 생성
	if (Platform.OS === 'android') {
		await Notifications.setNotificationChannelAsync('default', {
			name: '알림',
			importance: Notifications.AndroidImportance.MAX,
		});
	}

	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== 'granted') {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}

	if (finalStatus !== 'granted') {
		showToast('warn', '푸시 알림 권한이 없습니다. 설정에서 권한을 허용해주세요.');

		return null;
	}

	try {
		const { data: pushToken } = await Notifications.getExpoPushTokenAsync({
			projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
		});

		return pushToken;
	} catch (e: unknown) {
		throw new Error(`${e}`);
	}
}
