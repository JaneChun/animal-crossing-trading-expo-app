import SearchResultItem from '@/components/Search/SearchResultItem';
import SearchInput from '@/components/ui/inputs/SearchInput';
import LayoutWithHeader from '@/components/ui/layout/LayoutWithHeader';
import { Colors } from '@/constants/Color';
import { useItemSearch } from '@/hooks/firebase/useItemSearch';
import { useDebouncedValue } from '@/hooks/shared/useDebouncedValue';
import { Item } from '@/types/post';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const Search = () => {
	const [searchInput, setSearchInput] = useState<string>('');
	const debouncedKeyword = useDebouncedValue(searchInput, 300);

	const { items, isLoading } = useItemSearch({
		keyword: debouncedKeyword,
		size: 5,
	});

	const renderSearchResultItem = ({ item }: { item: Item }) => (
		<SearchResultItem item={item} searchInput={searchInput} />
	);

	return (
		<LayoutWithHeader
			headerCenterComponent={
				<SearchInput
					searchInput={searchInput}
					setSearchInput={setSearchInput}
					containerStyle={{ marginLeft: 8, marginRight: 12 }}
					placeholder='아이템 검색'
				/>
			}
			hasBorderBottom={false}
		>
			{isLoading ? (
				<View style={styles.infoContainer}>
					<Text style={styles.infoMessage}>검색 중...</Text>
				</View>
			) : (
				<FlatList
					data={items}
					keyExtractor={(item) => item.id}
					renderItem={renderSearchResultItem}
					contentContainerStyle={styles.listContainer}
					ListEmptyComponent={
						<View style={styles.infoContainer}>
							{searchInput && <Text style={styles.infoMessage}>결과 없음</Text>}
						</View>
					}
				/>
			)}
		</LayoutWithHeader>
	);
};

export default Search;

const styles = StyleSheet.create({
	listContainer: {
		paddingHorizontal: 12,
	},
	infoContainer: {
		paddingHorizontal: 12,
		paddingVertical: 12,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	infoMessage: {
		color: Colors.font_gray,
	},
});
