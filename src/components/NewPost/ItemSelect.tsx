import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

import Categories from '@/components/ui/Categories';
import SearchInput from '@/components/ui/inputs/SearchInput';
import { isArtworkWithFake, ITEM_CATEGORIES } from '@/constants/post';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useSearchItems } from '@/hooks/item/query/useSearchItems';
import { useDebouncedValue } from '@/hooks/shared/useDebouncedValue';
import { Colors } from '@/theme/Color';
import { CatalogItem, CatalogVariant } from '@/types/catalog';
import { ItemSelectProps } from '@/types/components';
import { ItemCategory, ItemCategoryItem } from '@/types/post';

import ItemSelectItem, { ITEM_HEIGHT } from './ItemSelectItem';
import ItemSelectSkeleton from './ItemSelectSkeleton';
import ItemVariantSelect from './ItemVariantSelect';

const ItemSelect = ({ addItemToCart, containerStyle }: ItemSelectProps) => {
	const [category, setCategory] = useState<ItemCategory>('All');
	const [searchInput, setSearchInput] = useState<string>('');
	const debouncedKeyword = useDebouncedValue(searchInput, 300);
	const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItem | null>(null);

	const {
		data: items = [],
		isLoading,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = useSearchItems(category, debouncedKeyword);

	const handleSelect = useCallback(
		(item: CatalogItem) => {
			if (item.bodyTitle || item.patternTitle) {
				// 변형이 있으면 variant 선택 화면으로 전환
				setSelectedCatalogItem(item);
			} else {
				let description: string | undefined = undefined;

				if (item.category === 'Artwork' && isArtworkWithFake(item)) {
					const genuine = item.attributes.genuine;
					if (genuine === 'Yes') {
						description = '진품';
					} else if (genuine === 'No') {
						description = '가품';
					}
				} else if (item.category === 'Recipes') {
					description = '레시피';
				}

				// 변형이 없으면 바로 추가
				addItemToCart({
					id: item.id,
					category: item.category,
					imageUrl: item.imageUrl,
					name: item.name,
					...(description && { color: description }),
				});
			}
		},
		[addItemToCart],
	);

	const backToList = useCallback(() => setSelectedCatalogItem(null), []);

	const handleVariantSelect = useCallback(
		(variant: CatalogVariant) => {
			if (!selectedCatalogItem) return;

			const variantTokens = [variant.body, variant.pattern].filter(Boolean);
			const color = variantTokens.length > 0 ? variantTokens.join(', ') : undefined;

			addItemToCart({
				id: variant.id,
				category: selectedCatalogItem.category,
				imageUrl: variant.imageUrl,
				name: selectedCatalogItem.name,
				...(color && { color }),
			});

			backToList(); // 추가 후 리스트로 전환
		},
		[addItemToCart, selectedCatalogItem, backToList],
	);

	const renderItemSelectItem = useCallback(
		({ item, index }: { item: CatalogItem; index: number }) => (
			<ItemSelectItem
				item={item}
				searchInput={searchInput}
				onSelect={handleSelect}
				index={index}
			/>
		),
		[searchInput, handleSelect],
	);

	const getItemLayout = useCallback(
		(_data: ArrayLike<CatalogItem> | null | undefined, index: number) => ({
			length: ITEM_HEIGHT,
			offset: ITEM_HEIGHT * index,
			index,
		}),
		[],
	);

	const fetchNext = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
			{/* 목록 화면 */}
			<View style={[styles.listWrapper, selectedCatalogItem && styles.hidden]}>
				{/* 검색 인풋 */}
				<View style={styles.header}>
					<SearchInput
						searchInput={searchInput}
						onChangeText={setSearchInput}
						resetSearchInput={() => setSearchInput('')}
						onSubmit={() => {}}
						placeholder="아이템 검색"
						containerStyle={{ marginBottom: 8 }}
						InputComponent={BottomSheetTextInput}
					/>

					{/* 카테고리 칩 */}
					<Categories<ItemCategory, ItemCategoryItem>
						categories={ITEM_CATEGORIES}
						category={category}
						setCategory={setCategory}
						containerStyle={{ marginVertical: 8 }}
					/>
				</View>

				{/* 아이템 목록 */}
				{category && (
					<View style={styles.listContainer}>
						{isLoading ? (
							<ItemSelectSkeleton />
						) : (
							<FlatList
								data={items}
								keyExtractor={(item) => item.id}
								contentContainerStyle={styles.itemList}
								renderItem={renderItemSelectItem}
								initialNumToRender={20}
								maxToRenderPerBatch={20}
								getItemLayout={getItemLayout}
								onEndReached={fetchNext}
								onEndReachedThreshold={0.5}
								ListEmptyComponent={getListEmptyComponent}
								keyboardShouldPersistTaps="handled"
							/>
						)}
					</View>
				)}
			</View>

			{/* Variant 선택 화면 */}
			{selectedCatalogItem && (
				<View style={styles.variantWrapper}>
					<ItemVariantSelect
						item={selectedCatalogItem}
						onBack={backToList}
						onSelect={handleVariantSelect}
					/>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingBottom: 60,
	},
	header: {
		paddingHorizontal: 24,
		paddingTop: 24,
	},
	listWrapper: {
		flex: 1,
	},
	variantWrapper: {
		flex: 1,
	},
	hidden: {
		display: 'none',
	},
	emptyText: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.regular,
		color: Colors.text.tertiary,
	},
	listContainer: {
		flex: 1,
	},
	itemList: {
		marginTop: 16,
		flexGrow: 1,
	},
	spinnerContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		height: 100,
	},
});

export default ItemSelect;
