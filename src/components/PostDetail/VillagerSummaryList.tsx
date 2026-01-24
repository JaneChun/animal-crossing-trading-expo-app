import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { FontSizes, FontWeights } from '@/constants/Typography';
import { VillagerSummaryListProps } from '@/types/components';
import { Villager } from '@/types/villager';

import VillagerItem from './VillagerItem';

const movingBoxIcon = require('../../../assets/images/moving_box.png');

const VillagerSummaryList = ({ type, villagers, containerStyle }: VillagerSummaryListProps) => {
	if (villagers.length === 0) return null;

	const renderVillagerItem = ({ item }: { item: Villager }) => <VillagerItem villager={item} />;

	return (
		<View style={containerStyle}>
			<View style={styles.labelContainer}>
				<Text style={styles.label}>{type === 'adopt' ? '입양할 주민' : '분양할 주민'}</Text>
				<FastImage source={movingBoxIcon} style={styles.boxIcon} />
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
		marginLeft: 2,
	},
	columnWrapper: {
		gap: 12,
		marginBottom: 12,
	},
});

export default VillagerSummaryList;
