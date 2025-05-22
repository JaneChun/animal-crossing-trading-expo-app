import PostList from '@/components/Home/PostList';
import SearchInput from '@/components/ui/inputs/SearchInput';
import { PADDING } from '@/components/ui/layout/Layout';
import LayoutWithHeader from '@/components/ui/layout/LayoutWithHeader';
import { Colors } from '@/constants/Color';
import { useDebouncedValue } from '@/hooks/shared/useDebouncedValue';
import { usePostContext } from '@/hooks/shared/usePostContext';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

const Search = () => {
	const [searchInput, setSearchInput] = useState<string>('');
	const { collectionName } = usePostContext();
	const [isSearchResultMode, setIsSearchResultMode] = useState(false);
	const debouncedKeyword = useDebouncedValue(searchInput, 300);

	// const { data = [], isFetching } = useKeywordSearch({
	// 	collectionName,
	// 	keyword: debouncedKeyword,
	// });

	// const renderSearchResultItem = ({ item }: { item: Post<Collection> }) => (
	// 	<SearchResultItem item={item} searchInput={searchInput} />
	// );

	const onSubmit = () => {
		setIsSearchResultMode(true);
	};

	return (
		<SafeAreaView style={styles.screen}>
			<LayoutWithHeader
				headerCenterComponent={
					<SearchInput
						searchInput={searchInput}
						onChangeText={(text: string) => {
							setSearchInput(text);
							if (isSearchResultMode) {
								setIsSearchResultMode(false);
							}
						}}
						resetSearchInput={() => setSearchInput('')}
						onSubmit={onSubmit}
						containerStyle={{ marginLeft: 8, marginRight: 12 }}
						placeholder={`${
							collectionName === 'Boards' ? '거래글' : '게시글'
						} 검색`}
					/>
				}
				hasBorderBottom={false}
			>
				{
					// isFetching ? (
					// 	<View style={styles.infoContainer}>
					// 		<Text style={styles.infoMessage}>검색 중...</Text>
					// 	</View>
					// ) :
					isSearchResultMode ? (
						<PostList
							collectionName={collectionName}
							filter={{ keyword: debouncedKeyword }}
							containerStyle={{ paddingHorizontal: PADDING }}
						/>
					) : (
						<View />
						// <FlatList
						// 	data={data}
						// 	keyExtractor={(item) => item.id}
						// 	renderItem={renderSearchResultItem}
						// 	contentContainerStyle={styles.listContainer}
						// 	ListEmptyComponent={
						// 		<View style={styles.infoContainer}>
						// 			{searchInput && (
						// 				<Text style={styles.infoMessage}>결과 없음</Text>
						// 			)}
						// 		</View>
						// 	}
						// />
					)
				}
			</LayoutWithHeader>
		</SafeAreaView>
	);
};

export default Search;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: 'white',
	},
	listContainer: {
		marginTop: 16,
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
