import { Feather } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import HighlightMatchText from '@/components/ui/HighlightMatchText';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { isArtworkWithFake } from '@/constants/post';
import { Colors } from '@/theme/Color';
import { ItemSelectItemProps } from '@/types/components';

export const ITEM_HEIGHT = 53;

const ItemSelectItem = ({ item, searchInput, onSelect, index }: ItemSelectItemProps) => {
	const hasVariants = !!(item.bodyTitle || item.patternTitle);

	let displayName = item.name;
	if (item.category === 'Artwork') {
		if (isArtworkWithFake(item)) {
			const genuine = item.attributes.genuine;
			if (genuine === 'Yes') {
				displayName += ' (진품)';
			} else if (genuine === 'No') {
				displayName += ' (가품)';
			}
		}
	}

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={styles.item}
				onPress={() => onSelect(item)}
				testID={index === 0 ? 'firstItemSelectItem' : `itemSelectItem-${index}`}
			>
				<ImageWithFallback uri={item?.imageUrl} style={styles.itemImage} priority="high" />
				<View style={styles.itemTextContainer}>
					<Text numberOfLines={1} ellipsizeMode="tail" style={styles.itemNameText}>
						{HighlightMatchText({
							text: displayName,
							keyword: searchInput,
							textStyle: {},
							highlightTextStyle: styles.highlight,
						})}
					</Text>
				</View>
				{hasVariants && (
					<Feather name="chevron-right" size={20} color={Colors.text.tertiary} />
				)}
			</TouchableOpacity>
		</View>
	);
};

export default memo(ItemSelectItem, (prevProps, nextProps) => {
	return (
		prevProps.item.id === nextProps.item.id && prevProps.searchInput === nextProps.searchInput
	);
});

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 24,
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		height: ITEM_HEIGHT,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border.default,
	},
	itemImage: {
		width: 40,
		height: 40,
		borderRadius: 12,
		marginRight: 12,
	},
	itemTextContainer: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'center',
	},
	itemNameText: {
		fontSize: 16,
		flex: 1,
	},
	highlight: {
		fontWeight: 800,
		color: Colors.brand.primary,
	},
});
