import { useActionSheet } from '@expo/react-native-action-sheet';
import { Entypo } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Spacing, useTheme } from '@/theme';
import { ActionSheetButtonProps } from '@/types/components';

const ActionSheetButton = ({
	color,
	size = 24,
	options,
	destructiveButtonIndex,
	cancelIndex,
}: ActionSheetButtonProps) => {
	const { showActionSheetWithOptions } = useActionSheet();
	const { colors } = useTheme();

	const handlePress = () => {
		showActionSheetWithOptions(
			{
				options: options.map(({ label }) => label),
				cancelButtonIndex: cancelIndex ?? options.length - 1, // 기본적으로 마지막 옵션을 '취소'로 설정
				...(destructiveButtonIndex ? { destructiveButtonIndex } : {}),
			},
			(buttonIndex) => {
				if (buttonIndex === undefined || !options[buttonIndex]) return;
				options[buttonIndex].onPress();
			},
		);
	};

	return (
		<TouchableOpacity
			style={styles.iconContainer}
			onPress={handlePress}
			testID="actionSheetButton"
		>
			<Entypo name="dots-three-vertical" size={size} color={color ?? colors.text.primary} />
		</TouchableOpacity>
	);
};

export default ActionSheetButton;

const styles = StyleSheet.create({
	iconContainer: {
		padding: Spacing.xs,
	},
});
