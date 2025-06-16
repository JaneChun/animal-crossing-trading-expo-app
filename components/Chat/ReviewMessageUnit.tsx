import { Colors } from '@/constants/Color';
import {
	createReview,
	getReviewBySenderId,
} from '@/firebase/services/reviewService';
import { useAuthStore } from '@/stores/AuthStore';
import { CreateReviewParams, ReviewValue } from '@/types/review';
import { FontAwesome6 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IMessage } from 'react-native-gifted-chat';

const ReviewMessageUnit = ({ message }: { message: IMessage }) => {
	const [localReview, setLocalReview] = useState<ReviewValue>(0);
	const [isReviewed, setIsReviewed] = useState<boolean>(false);
	const { postId, chatId } = JSON.parse(message.text);
	const userInfo = useAuthStore((state) => state.userInfo);

	const senderId = userInfo?.uid;
	const receiverId = chatId
		.split('_')
		.find((id: string) => id !== userInfo?.uid);

	// 리뷰한 적 있다면 불러오기
	useEffect(() => {
		if (!postId || !chatId || !senderId) return;

		const fetchReview = async () => {
			const review = await getReviewBySenderId(postId, chatId, senderId);

			if (review) {
				setLocalReview(review.value);
				setIsReviewed(true);
			}
		};

		fetchReview();
	}, [chatId, postId, receiverId]);

	const sendReview = async (receivedReview: ReviewValue) => {
		if (isReviewed || !receiverId || !senderId) return;

		const newReview: CreateReviewParams = {
			postId,
			chatId,
			senderId,
			receiverId,
			value: receivedReview,
		};

		await createReview(newReview);

		setLocalReview(receivedReview);
		setIsReviewed(true);

		// TODO: 유저 정보 수정
	};

	return (
		<View style={styles.container}>
			<View style={styles.messageContainer}>
				<View style={styles.textContainer}>
					<Text style={styles.text}>상대방과의 거래는 어땠나요?</Text>
				</View>

				<View style={styles.buttonsContainer}>
					<Pressable
						style={styles.iconContainer}
						disabled={isReviewed}
						onPress={() => sendReview(1)}
					>
						<FontAwesome6
							name='smile-beam'
							color={localReview === 1 ? Colors.icon_green : Colors.icon_gray}
							size={24}
						/>
					</Pressable>
					<Pressable
						style={styles.iconContainer}
						disabled={isReviewed}
						onPress={() => sendReview(-1)}
					>
						<FontAwesome6
							name='frown-open'
							color={localReview === -1 ? Colors.icon_red : Colors.icon_gray}
							size={24}
						/>
					</Pressable>
				</View>
			</View>
		</View>
	);
};

export default ReviewMessageUnit;

const styles = StyleSheet.create({
	container: {
		marginVertical: 16,
		marginHorizontal: 24,
	},
	messageContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		padding: 16,
	},
	textContainer: {
		marginBottom: 8,
	},
	text: {
		fontSize: 14,
		color: Colors.font_gray,
	},
	buttonsContainer: {
		flexDirection: 'row',
		gap: 16,
	},
	iconContainer: {
		width: 30,
		height: 30,
		borderRadius: 50,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
