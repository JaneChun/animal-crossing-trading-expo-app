import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { usePostDetail } from '@/hooks/query/post/usePostDetail';
import { useAuthStore } from '@/stores/AuthStore';
import { Message } from '@/types/chat';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PostNotExist from './PostNotExist';
import PostSummary from './PostSummary';
import PostSummaryLoading from './PostSummaryLoading';

const MessageUnit = ({
	message,
	receiverId,
}: {
	message: Message;
	receiverId: string;
}) => {
	const userInfo = useAuthStore((state) => state.userInfo);

	// system 메시지가 아닐 경우에는 usePostDetail 호출하지 않음
	const { postId, collectionName } = useMemo(() => {
		if (message.senderId !== 'system')
			return { postId: null, collectionName: null };

		try {
			const { postId, collectionName } = JSON.parse(message.body);
			return { postId, collectionName };
		} catch {
			return { postId: null, collectionName: null };
		}
	}, [message]);

	const { data: post, isLoading: isPostLoading } = usePostDetail(
		collectionName,
		postId,
	);

	const formattedDate = message.createdAt
		.toDate()
		.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

	// system 메시지일 경우 → post summary 출력
	if (message.senderId === 'system') {
		return (
			<View style={styles.postSummaryContainer}>
				{isPostLoading ? (
					<PostSummaryLoading />
				) : post ? (
					<PostSummary post={post} collectionName={collectionName} />
				) : (
					<PostNotExist />
				)}
			</View>
		);
	}

	// 일반 메시지 (내가 보낸 거 vs 받은 거)
	return message.senderId === userInfo?.uid ? (
		<View style={[styles.messageContainer, { alignSelf: 'flex-end' }]}>
			<View style={styles.infoContainer}>
				{message.isReadBy.includes(receiverId) && (
					<Text style={styles.infoText}>읽음</Text>
				)}
				<Text style={[styles.infoText]}>{formattedDate}</Text>
			</View>

			<View style={[styles.messageBubble, styles.sentBackground]}>
				<Text style={[styles.messageText, styles.sentTextColor]}>
					{message.body}
				</Text>
			</View>
		</View>
	) : (
		<View style={[styles.messageContainer, { alignSelf: 'flex-start' }]}>
			<View style={[styles.messageBubble, styles.receivedBackground]}>
				<Text style={[styles.messageText, styles.receivedTextColor]}>
					{message.body}
				</Text>
			</View>
			<Text style={styles.infoText}>{formattedDate}</Text>
		</View>
	);
};

export default MessageUnit;

const styles = StyleSheet.create({
	messageContainer: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 6,
		marginVertical: 4,
	},
	messageBubble: {
		maxWidth: '75%',
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
	},
	sentBackground: {
		backgroundColor: Colors.primary,
	},
	receivedBackground: {
		backgroundColor: 'white',
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
	postSummaryContainer: {
		width: '100%',
		alignSelf: 'center',
		marginVertical: 16,
	},
});
