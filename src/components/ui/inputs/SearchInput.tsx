import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

import SearchIcon from '@/components/Search/SearchIcon';
import { FontSizes } from '@/constants/Typography';
import { Colors } from '@/theme/Color';
import { SearchInputProps } from '@/types/components';

const SearchInput = ({
	searchInput,
	onChangeText,
	resetSearchInput,
	onSubmit,
	containerStyle,
	placeholder,
	InputComponent = TextInput,
}: SearchInputProps) => {
	return (
		<View style={[styles.searchContainer, containerStyle]}>
			<SearchIcon containerStyle={styles.searchIcon} color={Colors.text.tertiary} />
			<InputComponent
				style={styles.searchInput}
				value={searchInput}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={Colors.text.tertiary}
				enterKeyHint="search"
				onSubmitEditing={() => {
					if (searchInput.trim()) {
						onSubmit(searchInput.trim());
					}
				}}
				testID="searchInput"
			/>
			{searchInput && (
				<Pressable onPress={resetSearchInput}>
					<Ionicons name="close-circle" size={20} color={Colors.icon.default} />
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
		backgroundColor: Colors.bg.secondary,
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		fontSize: FontSizes.md,
	},
});
