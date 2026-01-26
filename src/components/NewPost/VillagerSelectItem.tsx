import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import HighlightMatchText from '@/components/ui/HighlightMatchText';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { VillagerSelectItemProps } from '@/types/components';

export const VILLAGER_ITEM_HEIGHT = 53;

const VillagerSelectItem = ({
	villager,
	searchInput,
	addVillager,
	index,
}: VillagerSelectItemProps) => {
	return (
		<TouchableOpacity
			style={styles.container}
			onPress={() => addVillager(villager)}
			testID={`villagerSelectItem-${index}`}
		>
			{/* 이미지 */}
			<View style={styles.imageContainer}>
				<ImageWithFallback uri={villager.imageUrl} style={styles.image} priority="normal" />
			</View>
			{/* 이름 */}
			<Text numberOfLines={1} ellipsizeMode="tail" style={styles.nameContainer}>
				<HighlightMatchText
					text={villager.name}
					keyword={searchInput}
					textStyle={styles.name}
					highlightTextStyle={styles.highlight}
				/>
			</Text>
		</TouchableOpacity>
	);
};

export default React.memo(VillagerSelectItem, (prevProps, nextProps) => {
	return (
		prevProps.villager.id === nextProps.villager.id &&
		prevProps.searchInput === nextProps.searchInput
	);
});

const styles = StyleSheet.create({
	container: {
		width: '31%',
		aspectRatio: '1/1',
		alignItems: 'center',
		padding: 8,
		backgroundColor: Colors.base,
		borderRadius: 12,
	},
	imageContainer: {
		position: 'relative',
	},
	image: {
		width: 60,
		height: 60,
		borderRadius: 8,
	},
	nameContainer: {
		fontSize: 16,
		flex: 1,
		marginTop: 4,
	},
	name: {
		fontWeight: FontWeights.semibold,
		fontSize: FontSizes.sm,
		color: Colors.font_dark_gray,
		textAlign: 'center',
	},
	highlight: {
		fontWeight: FontWeights.bold,
		color: Colors.primary,
		fontSize: FontSizes.sm,
	},
});
