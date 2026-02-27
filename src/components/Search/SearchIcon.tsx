import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { Colors } from '@/theme/Color';
import { SearchIconProps } from '@/types/components';
import { navigateToSearch } from '@/utilities/navigationHelpers';

const SearchIcon = ({
	color = Colors.text.primary,
	size = 24,
	containerStyle,
}: SearchIconProps) => (
	<Pressable style={containerStyle} onPress={navigateToSearch}>
		<Ionicons name="search-sharp" color={color} size={size} />
	</Pressable>
);

export default SearchIcon;
