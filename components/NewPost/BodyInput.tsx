import { BodyInputProps } from '@/types/components';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ValidationInput from '../ui/inputs/ValidationInput';

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
			{/* <Text style={labelStyle}>내용</Text> */}
			<ValidationInput
				type='postBody'
				input={body}
				setInput={setBody}
				placeholder='내용을 입력하세요.'
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
		minHeight: 300,
		lineHeight: 26,
		textAlignVertical: 'top',
		verticalAlign: 'middle',
	},
});
