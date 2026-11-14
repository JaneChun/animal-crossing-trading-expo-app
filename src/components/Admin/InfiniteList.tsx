import { ReactElement } from 'react';
import { FlatList, ListRenderItem, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import EmptyIndicator from '@/components/ui/EmptyIndicator';
import InlineLoadingIndicator from '@/components/ui/loading/InlineLoadingIndicator';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';

type InfiniteListProps<T> = {
	data: T[] | undefined;
	keyExtractor: (item: T) => string;
	renderItem: ListRenderItem<T>;
	isLoading: boolean;
	isError: boolean;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage: () => void;
	emptyMessage: string;
	ListHeaderComponent?: ReactElement;
	contentContainerStyle?: StyleProp<ViewStyle>;
};

// 관리자 목록 화면 공통: 첫 로딩, 빈 목록·실패 안내, 끝에 닿으면 다음 페이지
const InfiniteList = <T,>({
	data,
	keyExtractor,
	renderItem,
	isLoading,
	isError,
	hasNextPage,
	isFetchingNextPage,
	fetchNextPage,
	emptyMessage,
	ListHeaderComponent,
	contentContainerStyle,
}: InfiniteListProps<T>) => {
	if (isLoading) return <LoadingIndicator />;

	return (
		<FlatList
			data={data ?? []}
			keyExtractor={keyExtractor}
			renderItem={renderItem}
			onEndReached={() => {
				if (hasNextPage && !isFetchingNextPage) fetchNextPage();
			}}
			onEndReachedThreshold={0.5}
			ListHeaderComponent={ListHeaderComponent}
			ListEmptyComponent={
				<EmptyIndicator message={isError ? '목록을 불러오지 못했습니다.' : emptyMessage} />
			}
			ListFooterComponent={isFetchingNextPage ? <InlineLoadingIndicator /> : null}
			// 빈 목록 안내가 화면 가운데 오도록 콘텐츠 영역을 남은 높이까지 늘린다
			contentContainerStyle={[styles.content, contentContainerStyle]}
		/>
	);
};

export default InfiniteList;

const styles = StyleSheet.create({
	content: {
		flexGrow: 1,
	},
});
