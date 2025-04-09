import { Colors } from '@/constants/Color';
import { getPost } from '@/firebase/services/postService';
import { useAuthStore } from '@/stores/AuthStore';
import { Message as MessageType } from '@/types/components';
import { Post } from '@/types/post';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PostSummary from './PostSummary';
import PostSummaryLoading from './PostSummaryLoading';

const Message = ({
	message,
	receiverId,
}: {
	message: MessageType;
	receiverId: string;
}) => {
	const [post, setPost] = useState<Post | null>(null);
	const userInfo = useAuthStore((state) => state.userInfo);

	useEffect(() => {
		if (message.senderId !== 'system') return;

		const getPostInfo = async () => {
			const { collectionName, postId } = JSON.parse(message.body);
			if (!collectionName || !postId) return;

			const postInfo = await getPost(collectionName, postId);
			if (!postInfo) return;

			setPost(postInfo);
		};

		getPostInfo();
	}, []);

	const formattedDate = message.createdAt
		.toDate()
		.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

	if (message.senderId === 'system') {
		return (
			<View style={styles.postSummaryContainer}>
				{post ? <PostSummary {...post} /> : <PostSummaryLoading />}
			</View>
		);
	}

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
	postSummaryContainer: {
		width: '100%',
		alignSelf: 'center',
		marginVertical: 16,
	},
});
