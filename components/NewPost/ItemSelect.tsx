import { Colors } from '@/constants/Color';
import { ITEM_CATEGORIES } from '@/constants/post';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { useInfiniteItems } from '@/hooks/query/item/useInfiniteItems';
import { useDebouncedValue } from '@/hooks/shared/useDebouncedValue';
import { ItemSelectProps } from '@/types/components';
import { Item, ItemCategory, ItemCategoryItem } from '@/types/post';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Categories from '../ui/Categories';
import SearchInput from '../ui/inputs/SearchInput';
import InlineLoadingIndicator from '../ui/loading/InlineLoadingIndicator';
import { showToast } from '../ui/Toast';
import ItemSelectItem, { ITEM_HEIGHT } from './ItemSelectItem';

const ItemSelect = ({
	cart,
	setCart,
	containerStyle,
	labelStyle,
}: ItemSelectProps) => {
	const [category, setCategory] = useState<ItemCategory>('All');
	const [searchInput, setSearchInput] = useState<string>('');
	const debouncedKeyword = useDebouncedValue(searchInput, 300);

	const {
		data,
		isLoading,
		error,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		refetch,
		isFetching,
		status,
	} = useInfiniteItems(category, debouncedKeyword);

	const items = data?.pages.flatMap((page) => page.data) ?? [];

	const addItemToCart = useCallback(
		(item: Item) => {
			const isAlreadyAdded = cart.some((c) => c.id === item.id);

			if (isAlreadyAdded) {
				showToast('warn', '이미 추가된 아이템이에요.');
			} else {
				setCart([...cart, { ...item, quantity: 1, price: 1 }]);
				showToast('success', `${item.name}이(가) 추가되었어요.`);
			}
		},
		[cart],
	);

	const renderItemSelectItem = useCallback(
		({ item }: { item: Item }) => (
			<ItemSelectItem
				item={item}
				searchInput={searchInput}
				addItemToCart={addItemToCart}
			/>
		),
		[searchInput, cart],
	);

	return (
		<View style={[styles.container, containerStyle]}>
			{/* 검색 인풋 */}
			<SearchInput
				searchInput={searchInput}
				setSearchInput={setSearchInput}
				placeholder='아이템 검색'
				containerStyle={{ marginBottom: 8 }}
			/>

			{/* 카테고리 칩 */}
			<Categories<ItemCategory, ItemCategoryItem>
				categories={ITEM_CATEGORIES}
				category={category}
				setCategory={setCategory}
				containerStyle={{ marginVertical: 8 }}
			/>

			{/* 아이템 목록 */}
			{category && (
				<View style={styles.listContainer}>
					{isLoading ? (
						<InlineLoadingIndicator />
					) : (
						<FlatList
							data={items}
							keyExtractor={(item) => item.id}
							style={styles.itemList}
							renderItem={renderItemSelectItem}
							onEndReached={
								hasNextPage
									? ({ distanceFromEnd }) => fetchNextPage()
									: undefined
							}
							onEndReachedThreshold={0.9}
							onRefresh={refetch}
							refreshing={isFetching || isFetchingNextPage}
							ListEmptyComponent={() => (
								<View style={styles.spinnerContainer}>
									<Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
								</View>
							)}
							initialNumToRender={10}
							maxToRenderPerBatch={10}
							getItemLayout={(data, index) => ({
								length: ITEM_HEIGHT,
								offset: ITEM_HEIGHT * index,
								index,
							})}
						/>
					)}
				</View>
			)}
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
	itemList: {
		marginTop: 16,
	},
	spinnerContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		height: 100,
	},
});

export default ItemSelect;
