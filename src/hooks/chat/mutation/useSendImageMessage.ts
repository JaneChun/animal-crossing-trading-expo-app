import { showToast } from '@/components/ui/Toast';
import { sendMessage } from '@/firebase/services/chatService';
import { uploadObjectToStorage } from '@/firebase/services/imageService';
import { SendChatMessageParams } from '@/types/chat';
import { useMutation } from '@tanstack/react-query';
import { ImagePickerAsset } from 'expo-image-picker';

type SendImageMessageParams = Pick<SendChatMessageParams, 'chatId' | 'senderId' | 'receiverId'> & {
	image: ImagePickerAsset;
};

export const useSendImageMessage = () => {
	return useMutation({
		mutationFn: async ({ chatId, senderId, receiverId, image }: SendImageMessageParams) => {
			const downloadURLs = await uploadObjectToStorage({
				directory: 'Chats',
				images: [image],
			});

			const imageUrl = downloadURLs[0];
			if (!imageUrl) throw new Error('이미지 업로드에 실패했습니다.');

			await sendMessage({
				chatId,
				senderId,
				receiverId,
				message: '',
				imageUrl,
			});
		},
		onError: () => {
			showToast('error', '이미지 전송 중 오류가 발생했습니다.');
		},
	});
};
