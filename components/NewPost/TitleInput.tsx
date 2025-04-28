import { TitleInputProps } from '@/types/components';
import React from 'react';
import { View } from 'react-native';
import ValidationInput from '../ui/inputs/ValidationInput';

const TitleInput = ({
	title,
	setTitle,
	containerStyle,
	labelStyle,
	inputStyle,
	isSubmitted,
}: TitleInputProps) => {
	return (
		<View style={containerStyle}>
			{/* <Text style={labelStyle}>제목</Text> */}
			<ValidationInput
				type='postTitle'
				input={title}
				setInput={setTitle}
				placeholder='제목'
				inputStyle={inputStyle}
				isSubmitted={isSubmitted}
			/>
		</View>
	);
};

export default TitleInput;
