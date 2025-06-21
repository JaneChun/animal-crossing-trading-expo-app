import { CommentInputProps } from '@/types/components';
import { useState } from 'react';
import Input from '../ui/inputs/Input';

const CommentInput = ({ disabled, onSubmit }: CommentInputProps) => {
	const [commentInput, setCommentInput] = useState<string>('');

	const handleSubmit = () => {
		if (!commentInput.trim()) return;

		onSubmit(commentInput.trim());
		setCommentInput('');
	};

	return (
		<Input
			input={commentInput}
			setInput={setCommentInput}
			onPress={handleSubmit}
			style={{ borderTopWidth: 1 }}
			disabled={disabled}
			placeholder='댓글을 입력해주세요.'
			disabledPlaceHolder='댓글 쓰기는 로그인 후 가능합니다.'
		/>
	);
};

export default CommentInput;
