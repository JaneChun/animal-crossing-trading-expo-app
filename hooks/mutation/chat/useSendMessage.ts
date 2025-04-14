import { showToast } from '@/components/ui/Toast';
import { sendMessage } from '@/firebase/services/chatService';
import { SendChatMessageParams } from '@/types/chat';
import { useMutation } from '@tanstack/react-query';

export const useSendMessage = () => {
	return useMutation({
		mutationFn: ({
			chatId,
			senderId,
			receiverId,
			message,
		}: SendChatMessageParams) =>
			sendMessage({
				chatId,
				senderId,
				receiverId,
				message,
			}),
		onError: () => {
			showToast('error', '메세지 전송 중 오류가 발생했습니다.');
		},
	});
};
