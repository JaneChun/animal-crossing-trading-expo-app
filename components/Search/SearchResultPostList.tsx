import { Colors } from '@/constants/Color';
import { useKeywordSearch } from '@/hooks/query/post/useKeywordSearch';
import { Collection } from '@/types/post';
import React from 'react';
import { FlatList, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import PostUnit from '../Home/PostUnit';
import LoadingIndicator from '../ui/loading/LoadingIndicator';

type SearchResultPostListProps = {
	collectionName: Collection;
	keyword: string;
	containerStyle: StyleProp<ViewStyle>;
};

const SearchResultPostList = ({
	collectionName,
	keyword,
	containerStyle,
}: SearchResultPostListProps) => {
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
	} = useKeywordSearch({
		collectionName,
		keyword,
	});

	const flatListData = data?.pages.flat() ?? [];

	if (isLoading) {
		return <LoadingIndicator />;
	}

	return (
		<>
			<FlatList
				data={flatListData}
				keyExtractor={({ id }) => id}
				renderItem={({ item }) => (
					<PostUnit post={item} collectionName={collectionName} />
				)}
				style={[containerStyle]}
				onEndReached={
					hasNextPage ? ({ distanceFromEnd }) => fetchNextPage() : undefined
				}
				onEndReachedThreshold={0.5}
				onRefresh={refetch}
				refreshing={isFetching || isFetchingNextPage}
				ListFooterComponent={
					!hasNextPage ? (
						<Text style={styles.endText}>마지막 글입니다.</Text>
					) : null
				}
			/>
		</>
	);
};

const styles = StyleSheet.create({
	endText: {
		textAlign: 'center',
		color: Colors.font_gray,
		marginVertical: 16,
	},
});

export default SearchResultPostList;
