import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

import { Colors } from '@/theme';
import { CloseButtonProps } from '@/types/components';

const CloseButton = ({ onPress, size = 30, style }: CloseButtonProps) => {
	return (
		<TouchableOpacity style={[{ padding: 5 }, style]} onPress={onPress}>
			<Ionicons name="close" size={size} color={Colors.text.primary} />
		</TouchableOpacity>
	);
};

export default CloseButton;
