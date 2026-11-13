import { useCallback, useMemo } from 'react';
import { FlatList, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import PostListSkeleton from '@/components/Home/PostListSkeleton';
import PostUnit from '@/components/Home/PostUnit';
import Text from '@/components/ui/Text';
import { useSearchPosts } from '@/hooks/post/query/useSearchPosts';
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

	const fetchNext = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const getListFooterComponent = useMemo(() => {
		if (hasNextPage) return null;
		return (
			<Text variant="body2" color="tertiary" style={styles.endText}>
				마지막 글입니다.
			</Text>
		);
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
		marginVertical: 16,
	},
});

export default SearchResultPostList;
