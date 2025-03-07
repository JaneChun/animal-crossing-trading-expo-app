import { BodyInputProps } from '@/types/components';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ValidationInput from '../ui/ValidationInput';

const BodyInput = ({
	body,
	setBody,
	containerStyle,
	labelStyle,
	inputStyle,
	isSubmitted,
}: BodyInputProps) => {
	return (
		<View style={containerStyle}>
			<Text style={labelStyle}>내용</Text>
			<ValidationInput
				type='postBody'
				input={body}
				setInput={setBody}
				placeholder='2마일에 구매하고 싶어요. 채팅 주세요!'
				inputStyle={[inputStyle, styles.textarea]}
				multiline
				isSubmitted={isSubmitted}
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
