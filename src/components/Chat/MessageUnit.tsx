import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useUserInfo } from '@/stores/auth';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IMessage } from 'react-native-gifted-chat';

const MessageUnit = ({ message }: { message: IMessage }) => {
	const userInfo = useUserInfo();

	const formattedDate = (
		message.createdAt instanceof Date ? message.createdAt : new Date(message.createdAt)
	).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

	const isMine = message.user._id === userInfo?.uid;

	return (
		<View style={[styles.messageContainer, { alignSelf: isMine ? 'flex-end' : 'flex-start' }]}>
			{isMine && (
				<View style={styles.infoContainer}>
					{!message.received && <Text style={styles.infoText}>안읽음</Text>}
					<Text style={styles.infoText}>{formattedDate}</Text>
				</View>
			)}

			<View
				style={[styles.messageBubble, isMine ? styles.sentBubble : styles.receivedBubble]}
			>
				<Text
					style={[
						styles.messageText,
						isMine ? styles.sentTextColor : styles.receivedTextColor,
					]}
				>
					{message.text}
				</Text>
			</View>

			{!isMine && <Text style={styles.infoText}>{formattedDate}</Text>}
		</View>
	);
};

export default MessageUnit;

const styles = StyleSheet.create({
	messageContainer: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 6,
		marginBottom: 8,
	},
	messageBubble: {
		maxWidth: '75%',
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 16,
	},
	sentBubble: {
		backgroundColor: Colors.primary,
		marginRight: 24,
	},
	receivedBubble: {
		backgroundColor: 'white',
		marginLeft: 24,
	},
	messageText: {
		fontSize: 14,
		fontWeight: FontWeights.regular,
	},
	sentTextColor: {
		color: 'white',
	},
	receivedTextColor: {
		color: Colors.font_black,
	},
	infoContainer: {
		alignItems: 'flex-end',
	},
	infoText: {
		fontSize: FontSizes.xxs,
		color: Colors.font_gray,
		fontWeight: FontWeights.light,
	},
});
