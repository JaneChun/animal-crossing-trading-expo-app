import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

export async function registerForPushNotificationsAsync() {
	if (!Device.isDevice) {
		Alert.alert(
			'푸시 알림 권한이 없습니다.',
			'실제 기기에서만 푸시 알림을 받을 수 있습니다.',
		);
		return null;
	}

	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== 'granted') {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}

	if (finalStatus !== 'granted') {
		Alert.alert('푸시 알림 권한이 없습니다.', '설정에서 권한을 허용해주세요.');
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
