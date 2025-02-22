import { Colors } from '@/constants/Color';
import { TitleInputProps } from '@/types/components';
import React from 'react';
import { Text, TextInput, View } from 'react-native';

const TitleInput = ({
	title,
	setTitle,
	containerStyle,
	labelStyle,
	inputStyle,
}: TitleInputProps) => {
	return (
		<View style={containerStyle}>
			<Text style={labelStyle}>제목</Text>
			<TextInput
				value={title}
				onChangeText={(text) => setTitle(text)}
				placeholder='DIY 작업대 레시피 구해요 :)'
				placeholderTextColor={Colors.font_gray}
				style={inputStyle}
			/>
		</View>
	);
};

export default TitleInput;
