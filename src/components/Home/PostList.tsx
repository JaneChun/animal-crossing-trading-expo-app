import { FontAwesome6 } from '@expo/vector-icons';
import { useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import { showLongToast, showToast } from '@/components/ui/Toast';
import { auth } from '@/config/firebase';
import { NATIVE_AD_INTERVAL } from '@/constants/ads';
import { useInfinitePosts } from '@/hooks/post/query/useInfinitePosts';
import { useUserInfo } from '@/stores/auth';
import { Colors } from '@/theme/Color';
import { PostListProps } from '@/types/components';
import { Collection, PostWithCreatorInfo } from '@/types/post';
import {
	navigateToLogin,
	navigateToMyProfile,
	navigateToNewPost,
} from '@/utilities/navigationHelpers';

import NativeAdUnit from './NativeAdUnit';
import PostUnit from './PostUnit';

// ─── 리스트 아이템 타입 (게시글 | 광고) ─────────────────────────────────────────────
type PostItem = {
	type: 'post';
	data: PostWithCreatorInfo<Collection>;
};

type AdItem = {
	type: 'ad';
	id: string;
};

type ListItem = PostItem | AdItem;

/** 게시글 배열에 NATIVE_AD_INTERVAL 간격으로 광고 플레이스홀더를 삽입 */
const insertAds = (posts: PostWithCreatorInfo<Collection>[]): ListItem[] => {
	const result: ListItem[] = [];

	for (let i = 0; i < posts.length; i++) {
		// NATIVE_AD_INTERVAL개마다 광고 삽입 (첫 번째 광고는 10번째 게시글 뒤)
		if (i > 0 && i % NATIVE_AD_INTERVAL === 0) {
			result.push({ type: 'ad', id: `ad-${i}` });
		}
		result.push({ type: 'post', data: posts[i] });
	}

	return result;
};

const PostList = ({
	collectionName,
	filter,
	isAddPostButtonVisible = false,
	containerStyle,
}: PostListProps) => {
	const userInfo = useUserInfo();
	const {
		data: posts,
		isLoading,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		refetch,
		isFetching,
	} = useInfinitePosts(collectionName, filter);

	const listData = useMemo(() => insertAds(posts ?? []), [posts]);

	const onPressAddPostButton = () => {
		if (!userInfo || !auth.currentUser) {
			showToast('warn', '글 쓰기는 로그인 후 가능합니다.');
			navigateToLogin();
			return;
		}

		if (!userInfo.islandName) {
			showLongToast('warn', '섬 이름이 있어야 다른 유저와 거래할 수 있어요!');
			navigateToMyProfile();
			return;
		}

		navigateToNewPost(collectionName);
	};

	const renderItem = useCallback(
		({ item, index }: { item: ListItem; index: number }) => {
			if (item.type === 'ad') {
				return <NativeAdUnit />;
			}
			return <PostUnit post={item.data} collectionName={collectionName} index={index} />;
		},
		[collectionName],
	);

	const keyExtractor = useCallback((item: ListItem) => {
		return item.type === 'ad' ? item.id : item.data.id;
	}, []);

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
				data={listData}
				keyExtractor={keyExtractor}
				renderItem={renderItem}
				style={containerStyle}
				initialNumToRender={15}
				maxToRenderPerBatch={15}
				onEndReached={fetchNext}
				onEndReachedThreshold={0.5}
				onRefresh={refetch}
				refreshing={isFetching || isFetchingNextPage}
				ListFooterComponent={getListFooterComponent}
			/>

			{isAddPostButtonVisible && (
				<Pressable
					style={styles.addPostButton}
					onPress={onPressAddPostButton}
					testID="addPostButton"
				>
					<FontAwesome6 name="circle-plus" size={48} color={Colors.brand.primary} />
					<View style={styles.whiteBackground} />
				</Pressable>
			)}
		</>
	);
};

const styles = StyleSheet.create({
	endText: {
		textAlign: 'center',
		color: Colors.text.tertiary,
		marginVertical: 16,
	},
	addPostButton: {
		position: 'absolute',
		bottom: 20,
		right: 20,
		width: 50,
		height: 50,
	},
	whiteBackground: {
		position: 'absolute',
		top: 10,
		left: 10,
		width: 30,
		height: 30,
		zIndex: -1,
		backgroundColor: Colors.bg.primary,
		borderRadius: '50%',
	},
});

export default PostList;
