import { TitleInputProps } from '@/types/components';
import React from 'react';
import { Text, View } from 'react-native';
import ValidationInput from '../ui/ValidationInput';

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
			<Text style={labelStyle}>제목</Text>
			<ValidationInput
				type='postTitle'
				input={title}
				setInput={setTitle}
				placeholder='DIY 작업대 레시피 구해요 :)'
				inputStyle={inputStyle}
				isSubmitted={isSubmitted}
			/>
		</View>
	);
};

export default TitleInput;
