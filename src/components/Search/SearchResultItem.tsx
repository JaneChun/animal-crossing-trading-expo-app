import { StyleSheet, View } from 'react-native';

import HighlightMatchText from '@/components/ui/HighlightMatchText';
import Text from '@/components/ui/Text';
import Thumbnail from '@/components/ui/Thumbnail';
import { FontWeights , Theme, useThemedStyles } from '@/theme';
import { SearchResultItemProps } from '@/types/components';

const SearchResultItem = ({ item, searchInput }: SearchResultItemProps) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={styles.container}>
			<View style={{ marginRight: 8 }}>
				<Thumbnail previewImage={item.imageUrl} />
			</View>
			<Text variant="body1" numberOfLines={1} ellipsizeMode="tail" style={styles.row}>
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

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			paddingHorizontal: 12,
			paddingVertical: 6,
			borderBottomWidth: 1,
			borderBottomColor: colors.border.default,
			flexDirection: 'row',
			alignItems: 'center',
		},
		row: {
			flex: 1,
		},
		highlight: {
			fontWeight: FontWeights.semibold,
			color: colors.brand.primary,
		},
	});
