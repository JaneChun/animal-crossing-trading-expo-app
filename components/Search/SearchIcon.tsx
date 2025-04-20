import { navigateToSearch } from '@/utilities/navigationHelpers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const SearchIcon = (
	<TouchableOpacity style={{ paddingRight: 5 }} onPress={navigateToSearch}>
		<Ionicons name='search' color={Colors.font_black} size={24} />
	</TouchableOpacity>
);

export default SearchIcon;
