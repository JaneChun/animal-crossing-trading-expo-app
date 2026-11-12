import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { useTheme } from '@/theme';
import { SearchIconProps } from '@/types/components';
import { navigateToSearch } from '@/utilities/navigationHelpers';

const SearchIcon = ({ color, size = 24, containerStyle }: SearchIconProps) => {
	const { colors } = useTheme();

	return (
		<Pressable style={containerStyle} onPress={navigateToSearch}>
			<Ionicons name="search-sharp" color={color ?? colors.text.primary} size={size} />
		</Pressable>
	);
};

export default SearchIcon;
