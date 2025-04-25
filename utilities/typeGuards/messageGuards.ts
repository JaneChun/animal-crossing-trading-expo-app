import { MessageType, SystemMessage } from '@/types/chat';

export const isSystemMessage = (
	message: MessageType,
): message is SystemMessage => {
	return (message as SystemMessage).isDateSeparator === true;
};
