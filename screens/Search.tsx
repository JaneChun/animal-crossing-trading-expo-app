import SearchResultItem from '@/components/Search/SearchResultItem';
import LayoutWithHeader from '@/components/ui/LayoutWithHeader';
import { Colors } from '@/constants/Color';
import { useItemSearch } from '@/hooks/firebase/useItemSearch';
import { useDebouncedValue } from '@/hooks/shared/useDebouncedValue';
import { goBack } from '@/navigation/RootNavigation';
import { Item } from '@/types/post';
import { useState } from 'react';
import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
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
				<TextInput
					style={styles.searchInput}
					placeholder='아이템 검색'
					value={searchInput}
					onChangeText={setSearchInput}
				/>
			}
			headerRightComponent={
				<TouchableOpacity onPress={goBack}>
					<Text style={styles.closeText}>닫기</Text>
				</TouchableOpacity>
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
					ListEmptyComponent={
						<View style={styles.infoContainer}>
							<Text style={styles.infoMessage}>결과 없음</Text>
						</View>
					}
				/>
			)}
		</LayoutWithHeader>
	);
};

export default Search;

const styles = StyleSheet.create({
	searchInput: {
		flex: 1,
		fontSize: 14,
		padding: 8,
		borderWidth: 1,
		borderColor: Colors.border_gray,
		borderRadius: 6,
		backgroundColor: Colors.base,
	},
	closeText: {
		paddingHorizontal: 16,
		fontWeight: 600,
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
