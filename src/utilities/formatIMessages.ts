import {
	ExtendedIMessage,
	Message,
	ReviewMessagePayload,
	SystemMessagePayload,
} from '@/types/chat';
import { IMessage } from 'react-native-gifted-chat';

// JSON 파싱을 안전하게 처리
const safeJSONParse = <T>(str: string): T | null => {
	try {
		return JSON.parse(str) as T;
	} catch (error) {
		console.log('JSON 메시지 파싱 실패:', error);
		return null;
	}
};

export const formatIMessages = (messages: Message[], receiverUid?: string): ExtendedIMessage[] => {
	return messages
		.map((msg) => {
			const baseIMessage: IMessage = {
				_id: msg.id,
				text: msg.body,
				createdAt: msg.createdAt.toDate(),
				user: { _id: msg.senderId },
				received: receiverUid ? msg.isReadBy.includes(receiverUid) : false,
			};

			// 시스템 메시지
			if (msg.senderId === 'system' && msg.receiverId === 'system') {
				const payload = safeJSONParse<SystemMessagePayload>(msg.body);

				return {
					...baseIMessage,
					system: true,
					systemPayload: payload || undefined,
				};
			}

			// 리뷰 메시지
			if (msg.senderId === 'review' && msg.receiverId === 'review') {
				const payload = safeJSONParse<ReviewMessagePayload>(msg.body);

				return {
					...baseIMessage,
					review: true,
					reviewPayload: payload || undefined,
				};
			}

			// 이미지 메시지
			if (msg.imageUrl) {
				return {
					...baseIMessage,
					image: msg.imageUrl,
				};
			}

			// 일반 메시지
			return baseIMessage;
		})
		.reverse();
};
