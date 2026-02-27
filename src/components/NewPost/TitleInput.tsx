import { useFormContext } from 'react-hook-form';
import { View } from 'react-native';

import ValidationInput from '@/components/ui/inputs/ValidationInput';
import { TitleInputProps } from '@/types/components';

const TitleInput = ({
	title,
	setTitle,
	onBlur,
	containerStyle,
	labelStyle,
	inputStyle,
}: TitleInputProps) => {
	const {
		formState: { errors },
	} = useFormContext();

	const errorMessage = errors.title?.message as string;

	return (
		<View style={containerStyle}>
			<ValidationInput
				value={title}
				onChangeText={setTitle}
				placeholder="제목"
				onBlur={onBlur}
				inputStyle={inputStyle}
				errorMessageContainerStyle={{
					marginTop: 0,
					marginBottom: 8,
				}}
				errorMessage={errorMessage}
				testID="titleInput"
			/>
		</View>
	);
};

export default TitleInput;
