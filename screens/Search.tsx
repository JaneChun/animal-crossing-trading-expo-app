import SearchIcon from '@/components/Search/SearchIcon';
import LayoutWithHeader from '@/components/ui/LayoutWithHeader';
import { Colors } from '@/constants/Color';
import { useItemSearch } from '@/hooks/firebase/useItemSearch';
import { usePostContext } from '@/hooks/shared/usePostContext';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const Search = () => {
	const { collectionName } = usePostContext();
	const [searchInput, setSearchInput] = useState<string>('');
	const { results, loading } = useItemSearch(collectionName, searchInput);

	const highlightMatch = (text: string, keyword: string) => {
		if (!keyword) return <Text>{text}</Text>;

		const regex = new RegExp(`(${keyword})`, 'gi');
		const parts = text.split(regex);

		return parts.map((part, index) =>
			part.toLowerCase() === keyword.toLowerCase() ? (
				<Text key={index} style={styles.highlight}>
					{part}
				</Text>
			) : (
				<Text key={index}>{part}</Text>
			),
		);
	};

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
			headerRightComponent={<Text style={styles.closeText}>닫기</Text>}
			hasBorderBottom={false}
		>
			{loading ? (
				<Text style={styles.loading}>검색 중...</Text>
			) : (
				<FlatList
					data={results}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<TouchableOpacity style={styles.resultItem}>
							{SearchIcon}
							<Text style={{ flexWrap: 'wrap' }}>
								{highlightMatch(item.title, searchInput)}
							</Text>
						</TouchableOpacity>
					)}
					ListEmptyComponent={<Text style={styles.empty}>결과 없음</Text>}
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
	loading: {
		padding: 10,
		color: '#999',
	},
	empty: {
		padding: 10,
		color: '#999',
	},
	resultItem: {
		paddingHorizontal: 12,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		flexDirection: 'row',
		alignItems: 'center',
	},
	highlight: {
		fontWeight: 'bold',
		color: Colors.primary,
	},
});
