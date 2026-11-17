import { FontAwesome6 } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { PADDING } from '@/components/ui/layout/Layout';
import Text from '@/components/ui/Text';
import { showLongToast, showToast } from '@/components/ui/Toast';
import { auth } from '@/config/firebase';
import { announcementsQueryKey } from '@/hooks/announcement/query/useAnnouncements';
import { useInfinitePosts } from '@/hooks/post/query/useInfinitePosts';
import { useAdConfig } from '@/stores/ads';
import { useUserInfo } from '@/stores/auth';
import { Theme, useThemedStyles } from '@/theme';
import { insertAds } from '@/utilities/insertAds';
import {
	navigateToLogin,
	navigateToMyProfile,
	navigateToNewPost,
} from '@/utilities/navigationHelpers';

import NativeAdUnit from './NativeAdUnit';
import PostListSkeleton from './PostListSkeleton';
import PostUnit from './PostUnit';

import type { ListItem, PostListProps } from '@/types/components';

const PostList = ({
	collectionName,
	filter,
	isAddPostButtonVisible = false,
	containerStyle,
	ListHeaderComponent,
}: PostListProps) => {
	const styles = useThemedStyles(makeStyles);
	const queryClient = useQueryClient();
	const userInfo = useUserInfo();
	const { isNativeAdsEnabled, nativeAdInterval } = useAdConfig();
	const {
		data: posts = [],
		isLoading,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		refetch,
		isFetching,
	} = useInfinitePosts(collectionName, filter);

	const listData = useMemo(() => {
		if (!isNativeAdsEnabled) {
			return posts.map((data) => ({ type: 'post' as const, data }));
		}
		return insertAds(posts, nativeAdInterval);
	}, [posts, isNativeAdsEnabled, nativeAdInterval]);

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

	// 당겨서 새로고침하면 목록 머리의 공지도 함께 다시 조회한다
	const onRefresh = () => {
		refetch();
		queryClient.invalidateQueries({ queryKey: announcementsQueryKey });
	};

	const fetchNext = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const getListFooterComponent = useMemo(() => {
		if (isLoading || hasNextPage) return null;
		return (
			<Text variant="body2" color="tertiary" style={styles.endText}>
				마지막 글입니다.
			</Text>
		);
	}, [isLoading, hasNextPage, styles]);

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
				onRefresh={onRefresh}
				// 첫 로딩은 스켈레톤으로 보여 주므로 새로고침 표시를 띄우지 않는다
				refreshing={!isLoading && (isFetching || isFetchingNextPage)}
				ListHeaderComponent={ListHeaderComponent}
				// 로딩 중에도 목록을 유지해야 머리 영역(공지 줄)이 언마운트되지 않는다
				ListEmptyComponent={
					isLoading ? (
						<View style={styles.skeleton}>
							<PostListSkeleton />
						</View>
					) : null
				}
				ListFooterComponent={getListFooterComponent}
			/>

			{isAddPostButtonVisible && !isLoading && (
				<Pressable
					style={styles.addPostButton}
					onPress={onPressAddPostButton}
					testID="addPostButton"
				>
					<FontAwesome6 name="circle-plus" size={48} color={styles.addPostIcon.color} />
					<View style={styles.whiteBackground} />
				</Pressable>
			)}
		</>
	);
};

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		// 스켈레톤이 자체 좌우 여백을 가지므로 목록(containerStyle)의 PADDING과 겹치지 않게 상쇄한다
		skeleton: {
			marginHorizontal: -PADDING,
		},
		endText: {
			textAlign: 'center',
			marginVertical: 16,
		},
		addPostIcon: {
			color: colors.brand.primary,
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
			backgroundColor: colors.text.onBrand,
			borderRadius: '50%',
		},
	});

export default PostList;
