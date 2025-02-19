import { Colors } from '@/constants/Color';
import React, { Dispatch, SetStateAction } from 'react';
import {
	StyleProp,
	StyleSheet,
	Text,
	TextInput,
	TextStyle,
	View,
	ViewStyle,
} from 'react-native';

type BodyInputProps = {
	body: string;
	setBody: Dispatch<SetStateAction<string>>;
	containerStyle?: StyleProp<ViewStyle>;
	labelStyle?: StyleProp<TextStyle>;
	inputStyle?: StyleProp<TextStyle>;
};

const BodyInput = ({
	body,
	setBody,
	containerStyle,
	labelStyle,
	inputStyle,
}: BodyInputProps) => {
	return (
		<View style={containerStyle}>
			<Text style={labelStyle}>내용</Text>
			<TextInput
				value={body}
				onChangeText={setBody}
				placeholder='2마일에 구매하고 싶어요. 채팅 주세요!'
				placeholderTextColor={Colors.font_gray}
				style={[inputStyle, styles.textarea]}
				multiline
			/>
		</View>
	);
};

export default BodyInput;

const styles = StyleSheet.create({
	textarea: {
		height: 200,
		textAlignVertical: 'top',
	},
});
