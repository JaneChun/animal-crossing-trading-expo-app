import { CloseButtonProps } from '@/types/components';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native';

const CloseButton = ({ onPress, size = 30, style }: CloseButtonProps) => {
	return (
		<TouchableOpacity style={[{ padding: 5 }, style]} onPress={onPress}>
			<Ionicons name='close' size={size} color='#000' />
		</TouchableOpacity>
	);
};

export default CloseButton;
