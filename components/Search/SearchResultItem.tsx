import { Colors } from '@/constants/Color';
import { Item } from '@/types/post';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import HighlightMatchText from '../ui/HighlightMatchText';
import SearchIcon from './SearchIcon';

const SearchResultItem = ({
	item,
	searchInput,
}: {
	item: Item;
	searchInput: string;
}) => {
	return (
		<View style={styles.container}>
			{SearchIcon}
			<Text numberOfLines={1} ellipsizeMode='tail' style={styles.row}>
				{HighlightMatchText({
					text: item.name,
					keyword: searchInput,
					textStyle: {},
					highlightTextStyle: styles.highlight,
				})}
			</Text>
		</View>
	);
};

export default SearchResultItem;

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 12,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border_gray,
		flexDirection: 'row',
		alignItems: 'center',
	},
	row: {
		flex: 1,
	},
	highlight: {
		fontWeight: 800,
		color: Colors.primary,
	},
});
