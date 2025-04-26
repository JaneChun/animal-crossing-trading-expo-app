import { Colors } from '@/constants/Color';
import { FontSizes } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import React, { Dispatch, SetStateAction } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Pressable, TextInput } from 'react-native-gesture-handler';
import SearchIcon from '../../Search/SearchIcon';

const SearchInput = ({
	searchInput,
	setSearchInput,
	containerStyle,
	placeholder,
}: {
	searchInput: string;
	setSearchInput: Dispatch<SetStateAction<string>>;
	containerStyle?: ViewStyle;
	placeholder?: string;
}) => {
	return (
		<View style={[styles.searchContainer, containerStyle]}>
			<SearchIcon containerStyle={styles.searchIcon} color={Colors.font_gray} />
			<TextInput
				style={styles.searchInput}
				value={searchInput}
				onChangeText={setSearchInput}
				placeholder={placeholder}
				placeholderTextColor={Colors.font_gray}
				enterKeyHint='search'
			/>
			{searchInput && (
				<Pressable onPress={() => setSearchInput('')}>
					<Ionicons name='close-circle' size={20} color={Colors.icon_gray} />
				</Pressable>
			)}
		</View>
	);
};

export default SearchInput;

const styles = StyleSheet.create({
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderRadius: 8,
		backgroundColor: Colors.base,
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		fontSize: FontSizes.md,
	},
});
