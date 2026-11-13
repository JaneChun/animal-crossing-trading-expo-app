import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

import { Spacing, useTheme } from '@/theme';
import { CloseButtonProps } from '@/types/components';

const CloseButton = ({ onPress, size = 30, style }: CloseButtonProps) => {
	const { colors } = useTheme();

	return (
		<TouchableOpacity style={[{ padding: Spacing.xs }, style]} onPress={onPress}>
			<Ionicons name="close" size={size} color={colors.text.primary} />
		</TouchableOpacity>
	);
};

export default CloseButton;
