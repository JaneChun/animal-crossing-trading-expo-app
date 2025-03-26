import { useNotification } from '@/contexts/NotificationContext';
import axios from 'axios';
import React from 'react';
import { Button, Text, View } from 'react-native';

const MarketNotices = () => {
	const { notification, expoPushToken, error } = useNotification();

	const sendNotifiaction = async () => {
		try {
			const result = await axios.post('https://exp.host/--/api/v2/push/send', {
				to: expoPushToken,
				title: '알림 테스트',
				body: '알림 테스트입니다.',
			});
			console.log('result', result);
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<View>
			<Text>MarketNotices</Text>
			<Text style={{ color: 'red' }}>Your push token:</Text>
			<Text>{expoPushToken}</Text>

			<Text>Latest notification:</Text>
			<Text>{notification?.request.content.title}</Text>
			<Text>{JSON.stringify(notification?.request.content.data, null, 2)}</Text>

			<Button title='send Notification' onPress={sendNotifiaction}></Button>
		</View>
	);
};

export default MarketNotices;
