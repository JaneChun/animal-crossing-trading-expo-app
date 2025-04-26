import { Colors } from '@/constants/Color';
import { SearchIconProps } from '@/types/components';
import { navigateToSearch } from '@/utilities/navigationHelpers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable } from 'react-native';

const SearchIcon = ({
	color = Colors.font_black,
	size = 24,
	containerStyle,
}: SearchIconProps) => (
	<Pressable style={containerStyle} onPress={navigateToSearch}>
		<Ionicons name='search-sharp' color={color} size={size} />
	</Pressable>
);

export default SearchIcon;
