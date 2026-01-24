import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { FontSizes, FontWeights } from '@/constants/Typography';
import { VillagerSummaryListProps } from '@/types/components';
import { Villager } from '@/types/villager';

import VillagerItem from './VillagerItem';
import movingBoxIcon from '../../../assets/images/moving_box.png';

const VillagerSummaryList = ({ type, villagers, containerStyle }: VillagerSummaryListProps) => {
	if (villagers.length === 0) return null;

	const renderVillagerItem = ({ item }: { item: Villager }) => <VillagerItem villager={item} />;

	return (
		<View style={containerStyle}>
			<View style={styles.labelContainer}>
				<FastImage source={movingBoxIcon} style={styles.boxIcon} />
				<Text style={styles.label}>
					{type === 'adopt' ? '입양하고 싶어요' : '분양 보내요'}
				</Text>
			</View>

			<FlatList
				data={villagers}
				keyExtractor={(item) => item.id}
				numColumns={2}
				scrollEnabled={false}
				columnWrapperStyle={styles.columnWrapper}
				renderItem={renderVillagerItem}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	labelContainer: {
		flexDirection: 'row',
		alignItems: 'flex-start',
	},
	label: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.semibold,
		marginBottom: 16,
		marginTop: 6,
	},
	boxIcon: {
		width: 30,
		height: 30,
		marginRight: 2,
	},
	columnWrapper: {
		gap: 12,
		marginBottom: 12,
	},
});

export default VillagerSummaryList;
