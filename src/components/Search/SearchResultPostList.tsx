import { Colors } from '@/constants/Color';
import { useSearchPosts } from '@/hooks/post/query/useSearchPosts';
import { Collection, PostWithCreatorInfo } from '@/types/post';
import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import PostUnit, { POST_UNIT_HEIGHT } from '../Home/PostUnit';
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
	} = useSearchPosts({
		collectionName,
		keyword,
	});

	const flatListData = data?.pages.flat() ?? [];

	const renderPostUnit = useCallback(
		({ item }: { item: PostWithCreatorInfo<Collection> }) => (
			<PostUnit post={item} collectionName={collectionName} />
		),
		[collectionName],
	);

	const getItemLayout = useCallback(
		(_data: any, index: number) => ({
			length: POST_UNIT_HEIGHT,
			offset: POST_UNIT_HEIGHT * index,
			index,
		}),
		[],
	);

	const fetchNext = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const getListFooterComponent = useMemo(() => {
		if (hasNextPage) return null;
		return <Text style={styles.endText}>마지막 글입니다.</Text>;
	}, [hasNextPage]);

	if (isLoading) {
		return <LoadingIndicator />;
	}

	return (
		<>
			<FlatList
				data={flatListData}
				keyExtractor={({ id }) => id}
				renderItem={renderPostUnit}
				style={[containerStyle]}
				initialNumToRender={15}
				maxToRenderPerBatch={15}
				getItemLayout={getItemLayout}
				onEndReached={fetchNext}
				onEndReachedThreshold={0.5}
				onRefresh={refetch}
				refreshing={isFetching || isFetchingNextPage}
				ListFooterComponent={getListFooterComponent}
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
