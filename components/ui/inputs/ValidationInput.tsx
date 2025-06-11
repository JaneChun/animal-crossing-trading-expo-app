import { Colors } from '@/constants/Color';
import { FontSizes } from '@/constants/Typography';
import { ValidationInputProp } from '@/types/components';
import { FontAwesome6 } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, View } from 'react-native';

const ValidationInput = ({
	value,
	onChangeText,
	placeholder,
	inputStyle,
	errorMessageContainerStyle,
	multiline = false,
	errorMessage,
	onContentSizeChange,
	onLayout,
	onFocus,
	onBlur,
	InputComponent = TextInput,
}: ValidationInputProp) => {
	return (
		<>
			<InputComponent
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={Colors.font_gray}
				style={[inputStyle, errorMessage ? { borderColor: 'red' } : null]}
				multiline={multiline}
				onLayout={onLayout}
				onContentSizeChange={onContentSizeChange}
				onFocus={onFocus}
				onBlur={onBlur}
			/>
			{errorMessage ? (
				<View
					style={[errorMessageContainerStyle, styles.errorMessageContainer]}
				>
					<FontAwesome6 name='circle-exclamation' color='red' size={12} />
					<Text style={styles.errorMessage}>{errorMessage}</Text>
				</View>
			) : null}
		</>
	);
};

export default ValidationInput;

const styles = StyleSheet.create({
	errorMessageContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		marginTop: 6,
	},
	errorMessage: {
		color: Colors.badge_red,
		fontSize: FontSizes.xs,
	},
});
