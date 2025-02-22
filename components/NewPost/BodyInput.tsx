import { Colors } from '@/constants/Color';
import { BodyInputProps } from '@/types/components';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

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
