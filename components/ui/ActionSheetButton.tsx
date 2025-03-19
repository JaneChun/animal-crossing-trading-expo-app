import { Colors } from '@/constants/Color';
import { ActionSheetButtonProps } from '@/types/components';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Entypo } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

const ActionSheetButton = ({
	color = Colors.font_black,
	size = 24,
	options,
	cancelIndex,
}: ActionSheetButtonProps) => {
	const { showActionSheetWithOptions } = useActionSheet();

	const handlePress = () => {
		showActionSheetWithOptions(
			{
				options: options.map(({ label }) => label),
				cancelButtonIndex: cancelIndex ?? options.length - 1, // 기본적으로 마지막 옵션을 '취소'로 설정
			},
			(buttonIndex) => {
				if (buttonIndex === undefined || !options[buttonIndex]) return;
				options[buttonIndex].onPress();
			},
		);
	};

	return (
		<TouchableOpacity style={styles.iconContainer} onPress={handlePress}>
			<Entypo name='dots-three-vertical' size={size} color={color} />
		</TouchableOpacity>
	);
};

export default ActionSheetButton;

const styles = StyleSheet.create({
	iconContainer: {
		padding: 5,
	},
});
