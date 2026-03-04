import { collection, limit, query, Timestamp, where } from 'firebase/firestore';

import { db } from '@/config/firebase';
import firestoreRequest from '@/firebase/core/firebaseInterceptor';
import { addDocToFirestore, queryDocs } from '@/firebase/core/firestoreService';
import { SendChatMessageParams } from '@/types/chat';
import { CreateReviewParams } from '@/types/review';

import { sendMessage } from './chatService';

export const createReview = async (requestData: CreateReviewParams): Promise<void> => {
	await firestoreRequest('리뷰 생성', async () => {
		await addDocToFirestore({
			directory: 'Reviews',
			requestData: {
				...requestData,
				createdAt: Timestamp.now(),
			},
		});
	});
};

export const getReviewBySenderId = async (postId: string, chatId: string, senderId: string) => {
	try {
		const q = query(
			collection(db, 'Reviews'),
			where('postId', '==', postId),
			where('chatId', '==', chatId),
			where('senderId', '==', senderId),
			limit(1),
		);

		const docs = await queryDocs(q);

		return docs.length !== 0 ? docs[0] : null;
	} catch (e) {
		console.log('⚠️ 리뷰 조회 실패', e);
		return null;
	}
};

export const sendReviewSystemMessage = async ({
	postId,
	chatRoomIds = [],
}: {
	postId: string;
	chatRoomIds: string[];
}) => {
	await Promise.all(
		chatRoomIds.map(async (chatId: string) => {
			try {
				const reviewMessage: SendChatMessageParams = {
					chatId,
					senderId: 'review',
					receiverId: 'review',
					message: JSON.stringify({ postId, chatId }),
				};
				await sendMessage(reviewMessage);
			} catch (e) {
				console.log(`⚠️ 리뷰 시스템 메시지 전송 실패 (${chatId})`, e);
			}
		}),
	);
};
