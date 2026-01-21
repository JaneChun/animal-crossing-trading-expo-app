import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

import Categories from '@/components/ui/Categories';
import SearchInput from '@/components/ui/inputs/SearchInput';
import InlineLoadingIndicator from '@/components/ui/loading/InlineLoadingIndicator';
import { Colors } from '@/constants/Color';
import { VILLAGER_SPECIES } from '@/constants/post';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useDebouncedValue } from '@/hooks/shared/useDebouncedValue';
import { useVillagers } from '@/hooks/villager/query/useVillagers';
import { VillagerSelectProps } from '@/types/components';
import { Villager, VillagerSpecies, VillagerSpeciesItem } from '@/types/villager';

import VillagerSelectItem from './VillagerSelectItem';

const PADDING_BOTTOM = 40;

const VillagerSelect = ({ addVillager, containerStyle }: VillagerSelectProps) => {
	const [species, setSpecies] = useState<VillagerSpecies>('All');
	const [searchInput, setSearchInput] = useState<string>('');
	const debouncedKeyword = useDebouncedValue(searchInput, 300);

	const {
		data: villagerList = [],
		isLoading,
		refetch,
		isFetching,
	} = useVillagers(species, debouncedKeyword);

	const renderVillagerItem = useCallback(
		({ item, index }: { item: Villager; index: number }) => (
			<VillagerSelectItem
				villager={item}
				searchInput={searchInput}
				addVillager={addVillager}
				index={index}
			/>
		),
		[searchInput, addVillager],
	);

	const getListEmptyComponent = useMemo(
		() => (
			<View style={styles.spinnerContainer}>
				<Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
			</View>
		),
		[],
	);

	return (
		<View style={[styles.container, containerStyle]}>
			{/* 검색 인풋 */}
			<SearchInput
				searchInput={searchInput}
				onChangeText={setSearchInput}
				resetSearchInput={() => setSearchInput('')}
				onSubmit={() => Keyboard.dismiss()}
				placeholder="주민 검색"
				containerStyle={{ marginBottom: 8 }}
				InputComponent={BottomSheetTextInput}
			/>

			{/* 종(Species) 카테고리 칩 */}
			<Categories<VillagerSpecies, VillagerSpeciesItem>
				categories={VILLAGER_SPECIES}
				category={species}
				setCategory={setSpecies}
				containerStyle={{ marginVertical: 8 }}
			/>

			{/* 주민 목록 */}
			<View style={styles.listContainer}>
				{isLoading ? (
					<InlineLoadingIndicator />
				) : (
					<FlatList
						data={villagerList}
						keyExtractor={(item) => item.id}
						contentContainerStyle={styles.contentContainer}
						columnWrapperStyle={styles.columnWrapper}
						scrollIndicatorInsets={{ bottom: PADDING_BOTTOM }}
						renderItem={renderVillagerItem}
						numColumns={3}
						initialNumToRender={20}
						maxToRenderPerBatch={20}
						onRefresh={refetch}
						refreshing={isFetching}
						ListEmptyComponent={getListEmptyComponent}
						keyboardShouldPersistTaps="handled"
					/>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	emptyText: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.regular,
		color: Colors.font_gray,
	},
	listContainer: {
		flex: 1,
	},
	contentContainer: {
		marginTop: 16,
		paddingBottom: PADDING_BOTTOM,
	},
	columnWrapper: {
		justifyContent: 'flex-start',
		gap: 12,
		marginBottom: 12,
	},
	spinnerContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		height: 100,
	},
});

export default VillagerSelect;
