import { BodyInputProps } from '@/types/components';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import ValidationInput from '../ui/inputs/ValidationInput';

const BodyInput = ({
	body,
	setBody,
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
				placeholder='내용을 입력하세요.'
				inputStyle={[inputStyle, styles.textarea]}
				multiline
				scrollEnabled={false}
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
