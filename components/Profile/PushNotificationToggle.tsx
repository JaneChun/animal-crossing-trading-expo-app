import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { AppState, Linking, StyleSheet, Switch, View } from 'react-native';

const PushNotificationToggle = () => {
	const [osEnabled, setOsEnabled] = useState(false);

	// OS 권한 상태 조회
	const checkPermission = async () => {
		const { status } = await Notifications.getPermissionsAsync();
		setOsEnabled(status === 'granted');
	};

	// 마운트 및 포그라운드 복귀 시 권한 재체크
	useEffect(() => {
		checkPermission();

		const sub = AppState.addEventListener('change', (state) => {
			if (state === 'active') checkPermission();
		});
		return () => sub.remove();
	}, []);

	// 토글 스위치 누르면 설정 화면으로 이동
	const onToggle = () => {
		Linking.openURL('app-settings:');
	};

	return (
		<View style={styles.container}>
			<Switch value={osEnabled} onValueChange={onToggle} />
		</View>
	);
};

export default PushNotificationToggle;

const styles = StyleSheet.create({
	container: {
		// flexDirection: 'row',
		// alignItems: 'center',
	},
});
