import { IMessage } from 'react-native-gifted-chat';

interface CreateIMessageParams {
	senderId: string;
	text?: string;
	image?: string;
}

export const createIMessage = ({ senderId, text, image }: CreateIMessageParams): IMessage => {
	return {
		_id: `${Date.now()}`,
		text: text ?? '',
		createdAt: new Date(),
		user: {
			_id: senderId,
		},
		...(image && { image }),
	};
};
