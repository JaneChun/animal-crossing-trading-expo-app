import { Colors } from '@/constants/Color';
import { FontSizes } from '@/constants/Typography';
import { InputProps } from '@/types/components';
import { FontAwesome6 } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

const Input = ({
	input,
	setInput,
	onPress,
	style,
	placeholder,
	disabled = false,
	disabledPlaceHolder,
}: InputProps) => {
	return (
		<View style={[styles.inputContainer, style]}>
			<TextInput
				style={styles.inputText}
				value={input}
				onChangeText={setInput}
				placeholder={
					disabled && disabledPlaceHolder ? disabledPlaceHolder : placeholder
				}
				multiline
				enterKeyHint='send'
				editable={!disabled}
			/>
			<Pressable
				style={styles.iconContainer}
				onPress={onPress}
				disabled={disabled}
			>
				<FontAwesome6
					name='circle-arrow-up'
					size={28}
					color={disabled ? Colors.icon_gray : Colors.primary}
				/>
			</Pressable>
		</View>
	);
};

export default Input;

const styles = StyleSheet.create({
	inputContainer: {
		flexDirection: 'row',
		backgroundColor: 'white',
		alignItems: 'center',
		borderColor: Colors.border_gray,
	},
	inputText: {
		flex: 1,
		borderWidth: 1,
		borderColor: Colors.border_gray,
		backgroundColor: Colors.base,
		borderRadius: 20,
		paddingVertical: 10,
		paddingHorizontal: 16,
		margin: 8,
		fontSize: FontSizes.md,
		color: Colors.font_gray,
	},
	iconContainer: {
		marginRight: 16,
	},
});
