import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { SearchResultItemProps } from '@/types/components';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import HighlightMatchText from '@/components/ui/HighlightMatchText';
import Thumbnail from '@/components/ui/Thumbnail';

const SearchResultItem = ({ item, searchInput }: SearchResultItemProps) => {
	return (
		<View style={styles.container}>
			<View style={{ marginRight: 8 }}>
				<Thumbnail previewImage={item.imageUrl} />
			</View>
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
		paddingVertical: 6,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border_gray,
		flexDirection: 'row',
		alignItems: 'center',
	},
	row: {
		flex: 1,
		fontSize: FontSizes.md,
	},
	highlight: {
		fontWeight: FontWeights.semibold,
		color: Colors.primary,
	},
});
