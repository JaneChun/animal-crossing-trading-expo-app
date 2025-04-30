import { useSendMessage } from '@/hooks/mutation/chat/useSendMessage';
import { ChatInputProps } from '@/types/components';
import React, { useState } from 'react';
import Input from '../ui/inputs/Input';

const ChatInput = ({
	chatId,
	senderUid,
	receiverUid,
	scrollToBottom,
}: ChatInputProps) => {
	const [chatInput, setChatInput] = useState('');

	const { mutate: sendMessage } = useSendMessage();

	const onSubmit = async () => {
		if (!senderUid || !receiverUid || chatInput.trim() === '') return;

		sendMessage({
			chatId,
			senderId: senderUid,
			receiverId: receiverUid,
			message: chatInput.trim(),
		});

		setChatInput('');
		scrollToBottom();
	};

	return (
		<Input
			input={chatInput}
			setInput={setChatInput}
			placeholder='메세지 보내기'
			onPress={onSubmit}
		/>
	);
};

export default ChatInput;
