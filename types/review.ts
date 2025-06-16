import { Timestamp } from 'firebase/firestore';

export type ReviewValue = 1 | -1 | 0; // 1: 만족, -1: 불만족, 0: 선택 안 함

export interface Review {
	postId: string;
	chatId: string;
	senderId: string;
	receiverId: string;
	value: ReviewValue;
	createdAt: Timestamp;
}

export type CreateReviewParams = Omit<Review, 'createdAt'>;
