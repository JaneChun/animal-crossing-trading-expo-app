import { ChatInputProps } from '@/types/components';
import React, { useState } from 'react';
import Input from '../ui/inputs/Input';

const ChatInput = ({ disabled, onSubmit }: ChatInputProps) => {
	const [chatInput, setChatInput] = useState('');

	const handleSubmit = () => {
		if (!chatInput.trim()) return;

		onSubmit(chatInput.trim());
		setChatInput('');
	};

	return (
		<Input
			input={chatInput}
			setInput={setChatInput}
			onPress={handleSubmit}
			placeholder='메세지 보내기'
			disabled={disabled}
			disabledPlaceHolder='메세지를 보낼 수 없습니다.'
		/>
	);
};

export default ChatInput;
