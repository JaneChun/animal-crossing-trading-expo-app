import { db } from '@/fbase';
import { SendChatMessageParams } from '@/types/chat';
import { CreateReviewParams } from '@/types/review';
import { collection, limit, query, Timestamp, where } from 'firebase/firestore';
import firestoreRequest from '../core/firebaseInterceptor';
import { addDocToFirestore, queryDocs } from '../core/firestoreService';
import { sendMessage } from './chatService';
import { updateUserReview } from './userService';

export const createReview = async (
	requestData: CreateReviewParams,
): Promise<string> => {
	return firestoreRequest('리뷰 생성', async () => {
		// 리뷰 생성
		const createdId = await addDocToFirestore({
			directory: 'Reviews',
			requestData: {
				...requestData,
				createdAt: Timestamp.now(),
			},
		});

		// 사용자 데이터 수정
		await updateUserReview({
			userId: requestData.receiverId,
			value: requestData.value,
		});

		return createdId;
	});
};

export const getReviewBySenderId = async (
	postId: string,
	chatId: string,
	senderId: string,
) => {
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
		chatRoomIds.map((chatId: string) => {
			try {
				const reviewMessage: SendChatMessageParams = {
					chatId,
					senderId: 'review',
					receiverId: 'review',
					message: JSON.stringify({ postId, chatId }),
				};

				return sendMessage(reviewMessage);
			} catch (e) {
				console.log(`⚠️ 리뷰 시스템 메시지 전송 실패 (${chatId})`, e);
			}
		}),
	);
};

export const getRecent30DaysReportCount = async ({
	userId,
}: {
	userId: string;
}): Promise<number> => {
	const reportRef = collection(db, 'Report');
	const now = new Date();
	const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

	const q = query(
		reportRef,
		where('reporteeId', '==', userId),
		where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
	);

	const recent30DaysReport = await queryDocs(q);

	return recent30DaysReport.length;
};
