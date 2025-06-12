import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { NumberInputProps } from '@/types/components';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

const NumberInput = ({
	value,
	setValue,
	InputComponent = TextInput,
	style,
}: NumberInputProps) => {
	const [tempValue, setTempValue] = useState<string>(String(value));

	// 외부 value가 바뀌었을 때도 tempValue를 반영
	useEffect(() => {
		setTempValue(String(value));
	}, [value]);

	const onDecrement = () =>
		setValue((prev) => {
			const newValue = Math.max(prev - 1, 1);
			setTempValue(String(newValue));
			return newValue;
		});

	const onIncrement = () =>
		setValue((prev) => {
			const newValue = prev + 1;
			setTempValue(String(newValue));
			return newValue;
		});

	const handleChangeText = (text: string) => {
		// 숫자 이외 제거
		const sanitized = text.replace(/[^0-9]/g, '');
		setTempValue(sanitized);
	};

	const handleEndEditing = () => {
		const numeric = parseInt(tempValue, 10);

		// 빈 입력 또는 0 이하 → 1로 보정
		if (isNaN(numeric) || numeric < 1) {
			setValue(1);
			setTempValue('1');
		} else {
			setValue(numeric);
			setTempValue(String(numeric));
		}
	};

	return (
		<View style={[styles.inputContainer, style]}>
			<Pressable onPress={onDecrement}>
				<Feather name='minus' size={24} color={Colors.font_gray} />
			</Pressable>

			{/* 숫자 입력 필드 */}
			<TextInput
				style={styles.text}
				keyboardType='numeric'
				value={tempValue}
				editable={true}
				onChangeText={handleChangeText}
				onEndEditing={handleEndEditing}
				maxLength={6}
			/>

			<Pressable onPress={onIncrement}>
				<Feather name='plus' size={24} color={Colors.font_gray} />
			</Pressable>
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
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
		color: Colors.font_black,
	},
});
