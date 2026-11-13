import { FlatList, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import Text from '@/components/ui/Text';
import { VillagerSummaryListProps } from '@/types/components';
import { Villager } from '@/types/villager';
import movingBoxIcon from '@assets/images/moving_box.png';

import VillagerItem from './VillagerItem';

const VillagerSummaryList = ({ type, villagers, containerStyle }: VillagerSummaryListProps) => {
	if (villagers.length === 0) return null;

	const renderVillagerItem = ({ item }: { item: Villager }) => <VillagerItem villager={item} />;

	return (
		<View style={containerStyle}>
			<View style={styles.labelContainer}>
				<FastImage source={movingBoxIcon} style={styles.boxIcon} />
				<Text variant="body1" weight="semibold" style={styles.label}>
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
