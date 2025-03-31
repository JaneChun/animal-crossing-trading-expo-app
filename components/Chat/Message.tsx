import { Colors } from '@/constants/Color';
import { useAuthStore } from '@/stores/AuthStore';
import { Message as MessageType } from '@/types/components';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Message = ({
	message,
	receiverId,
}: {
	message: MessageType;
	receiverId: string;
}) => {
	const userInfo = useAuthStore((state) => state.userInfo);

	const formattedDate = message.createdAt
		.toDate()
		.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

	return message.senderId === userInfo?.uid ? (
		<View style={[styles.messageContainer, { alignSelf: 'flex-end' }]}>
			{message.isReadBy.includes(receiverId) && (
				<Text style={styles.readText}>읽음</Text>
			)}
			<Text style={styles.messageTime}>{formattedDate}</Text>
			<View style={[styles.messageBubble, styles.sentBackground]}>
				<Text style={styles.sentText}>{message.body}</Text>
			</View>
		</View>
	) : (
		<View style={[styles.messageContainer, { alignSelf: 'flex-start' }]}>
			<View style={[styles.messageBubble, styles.receivedBackground]}>
				<Text style={styles.receivedText}>{message.body}</Text>
			</View>
			<Text style={styles.messageTime}>{formattedDate}</Text>
		</View>
	);
};

export default Message;

const styles = StyleSheet.create({
	messageContainer: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 6,
		marginVertical: 8,
	},
	messageBubble: {
		maxWidth: '75%',
		padding: 10,
		borderRadius: 8,
	},
	sentBackground: {
		backgroundColor: Colors.primary,
	},
	receivedBackground: {
		backgroundColor: Colors.border_gray,
	},
	sentText: {
		fontSize: 14,
		color: 'white',
	},
	receivedText: {
		fontSize: 14,
		color: Colors.font_black,
	},
	messageTime: {
		fontSize: 10,
		color: Colors.font_gray,
	},
	readText: {
		fontSize: 10,
		color: Colors.font_gray,
		paddingBottom: 1,
	},
});
