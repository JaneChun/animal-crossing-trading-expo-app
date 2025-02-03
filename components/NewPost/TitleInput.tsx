import {
	View,
	Text,
	TextInput,
	StyleProp,
	ViewStyle,
	TextStyle,
	StyleSheet,
} from 'react-native';
import React, { Dispatch, SetStateAction } from 'react';
import { Colors } from '@/constants/Color';

type TitleInputProps = {
	title: string;
	setTitle: Dispatch<SetStateAction<string>>;
	containerStyle?: StyleProp<ViewStyle>;
	labelStyle?: StyleProp<TextStyle>;
	inputStyle?: StyleProp<TextStyle>;
};

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
