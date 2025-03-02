import { Colors } from '@/constants/Color';
import { Feather } from '@expo/vector-icons';
import React, { Dispatch, SetStateAction } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const NumberInput = ({
	value,
	setValue,
}: {
	value: number;
	setValue: Dispatch<SetStateAction<number>>;
}) => {
	const onDecrement = () => setValue((prev) => Math.max(prev - 1, 0));
	const onIncrement = () => setValue((prev) => prev + 1);

	const handleChangeText = (text: string) => {
		const newValue = parseInt(text, 10);
		if (!isNaN(newValue)) setValue(newValue);
	};

	return (
		<View style={styles.inputContainer}>
			<TouchableOpacity onPress={onDecrement}>
				<Feather name='minus' size={24} color={Colors.font_gray} />
			</TouchableOpacity>

			{/* 숫자 입력 필드 */}
			<TextInput
				style={styles.text}
				keyboardType='numeric'
				value={String(value)}
				editable={true}
				onChangeText={handleChangeText}
				maxLength={6}
			/>

			<TouchableOpacity onPress={onIncrement}>
				<Feather name='plus' size={24} color={Colors.font_gray} />
			</TouchableOpacity>
		</View>
	);
};

export default NumberInput;

const styles = StyleSheet.create({
	inputContainer: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: Colors.border_gray,
		borderRadius: 8,
		backgroundColor: 'transparent',
		height: 48,
		paddingHorizontal: 16,
	},
	text: {
		fontSize: 16,
		fontWeight: 600,
		color: Colors.font_black,
	},
});
