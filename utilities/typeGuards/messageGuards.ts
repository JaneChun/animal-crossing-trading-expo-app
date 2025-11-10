import { ReviewIMessage, SystemIMessage } from '@/types/chat';
import { IMessage } from 'react-native-gifted-chat';

export const isSystemMessage = (message: IMessage): message is SystemIMessage => {
	return 'system' in message && message.system === true;
};

export const isReviewMessage = (message: IMessage): message is ReviewIMessage => {
	return 'review' in message && message.review === true;
};
