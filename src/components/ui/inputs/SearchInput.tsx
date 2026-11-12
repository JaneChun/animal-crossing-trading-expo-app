import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

import SearchIcon from '@/components/Search/SearchIcon';
import { FontSizes } from '@/constants/Typography';
import { BorderRadius, Spacing, Theme, useTheme, useThemedStyles } from '@/theme';
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
	const styles = useThemedStyles(makeStyles);
	const { colors } = useTheme();

	return (
		<View style={[styles.searchContainer, containerStyle]}>
			<SearchIcon containerStyle={styles.searchIcon} color={colors.text.tertiary} />
			<InputComponent
				style={styles.searchInput}
				value={searchInput}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={colors.text.tertiary}
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
					<Ionicons name="close-circle" size={20} color={colors.icon.default} />
				</Pressable>
			)}
		</View>
	);
};

export default SearchInput;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		searchContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			padding: Spacing.m,
			borderRadius: BorderRadius.s,
			backgroundColor: colors.bg.secondary,
		},
		searchIcon: {
			marginRight: Spacing.s,
		},
		searchInput: {
			flex: 1,
			fontSize: FontSizes.md,
		},
	});
