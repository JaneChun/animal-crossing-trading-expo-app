import { useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import ValidationInput from '@/components/ui/inputs/ValidationInput';
import { BodyInputProps } from '@/types/components';
import { getInsertedText, isBulkItemText } from '@/utilities/itemTextLines';

const BodyInput = ({
	body,
	setBody,
	onBlur,
	containerStyle,
	labelStyle: _labelStyle,
	inputStyle,
	onPasteItemText,
}: BodyInputProps) => {
	const {
		formState: { errors },
	} = useFormContext();
	const errorMessage = errors.body?.message as string;

	// 멀티라인 텍스트가 한 번에 삽입되면 붙여넣기로 판단
	const handleChangeText = (text: string) => {
		setBody(text);

		if (!onPasteItemText) return;

		const insertedText = getInsertedText(body, text);
		if (isBulkItemText(insertedText)) {
			onPasteItemText(insertedText);
		}
	};

	return (
		<View style={containerStyle}>
			<ValidationInput
				value={body}
				onChangeText={handleChangeText}
				onBlur={onBlur}
				placeholder="내용을 입력하세요."
				inputStyle={[inputStyle, styles.textarea]}
				multiline
				errorMessageContainerStyle={{
					marginTop: 0,
					marginBottom: 8,
				}}
				errorMessage={errorMessage}
				testID="bodyInput"
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
