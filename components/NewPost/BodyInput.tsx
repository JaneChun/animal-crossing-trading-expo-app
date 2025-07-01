import { BodyInputProps } from '@/types/components';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import ValidationInput from '../ui/inputs/ValidationInput';

const BodyInput = ({
	body,
	setBody,
	onBlur,
	containerStyle,
	labelStyle,
	inputStyle,
}: BodyInputProps) => {
	const {
		formState: { errors },
	} = useFormContext();
	const errorMessage = errors.body?.message as string;

	return (
		<View style={containerStyle}>
			<ValidationInput
				value={body}
				onChangeText={setBody}
				onBlur={onBlur}
				placeholder='내용을 입력하세요.'
				customPlaceHolder={`신고가 쌓이면 이용이 제한될 수 있어요\n누구나 기분 좋은 커뮤니티, 함께 지켜주세요 🍀`}
				inputStyle={[inputStyle, styles.textarea]}
				multiline
				errorMessageContainerStyle={{
					marginTop: 0,
					marginBottom: 8,
				}}
				errorMessage={errorMessage}
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
		paddingBottom: 12,
	},
});
