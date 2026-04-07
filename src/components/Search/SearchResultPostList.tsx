import { useCallback, useMemo } from 'react';
import { FlatList, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import PostListSkeleton from '@/components/Home/PostListSkeleton';
import PostUnit, { POST_UNIT_HEIGHT } from '@/components/Home/PostUnit';
import { useSearchPosts } from '@/hooks/post/query/useSearchPosts';
import { Colors } from '@/theme/Color';
import { Collection, PostWithCreatorInfo } from '@/types/post';

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
	const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage, refetch, isFetching } =
		useSearchPosts({
			collectionName,
			keyword,
		});

	const flatListData = data?.pages.flat() ?? [];

	const renderPostUnit = useCallback(
		({ item, index }: { item: PostWithCreatorInfo<Collection>; index: number }) => (
			<PostUnit post={item} collectionName={collectionName} index={index} />
		),
		[collectionName],
	);

	const getItemLayout = useCallback(
		(_data: ArrayLike<PostWithCreatorInfo<Collection>> | null | undefined, index: number) => ({
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
		return <PostListSkeleton />;
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
		color: Colors.text.tertiary,
		marginVertical: 16,
	},
});

export default SearchResultPostList;
