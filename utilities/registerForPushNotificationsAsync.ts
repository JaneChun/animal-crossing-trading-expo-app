import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

export async function registerForPushNotificationsAsync() {
	if (Device.isDevice) {
		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();

		let finalStatus = existingStatus;

		if (existingStatus !== 'granted') {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}

		if (finalStatus !== 'granted') {
			return Alert.alert(
				'푸쉬 알림을 받을 수 있는 권한이 없습니다.',
				'설정에서 푸쉬 알림을 받을 수 있는 권한을 허용해주세요.',
			);
		}

		const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

		if (!projectId) throw new Error('Project ID not found');

		try {
			const { data: pushTokenString } =
				await Notifications.getExpoPushTokenAsync({
					projectId,
				});

			return pushTokenString;
		} catch (e: unknown) {
			throw new Error(`${e}`);
		}
	} else {
		return Alert.alert(
			'푸쉬 알림을 받을 수 있는 권한이 없습니다.',
			'실제 기기에서만 푸쉬 알림을 받을 수 있습니다.',
		);
	}
}
