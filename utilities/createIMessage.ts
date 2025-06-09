import { IMessage } from 'react-native-gifted-chat';

export const createIMessage = (senderId: string, text: string) => {
	const message: IMessage = {
		_id: `${Date.now()}`,
		text,
		createdAt: new Date(),
		user: {
			_id: senderId,
		},
	};

	return message;
};
