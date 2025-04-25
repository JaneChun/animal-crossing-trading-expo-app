import { Colors } from '@/constants/Color';
import { auth } from '@/fbase';
import { useInfinitePosts } from '@/hooks/query/post/useInfinitePosts';
import { useAuthStore } from '@/stores/AuthStore';
import { PostListProps } from '@/types/components';
import {
	navigateToLogin,
	navigateToMyProfile,
	navigateToNewPost,
} from '@/utilities/navigationHelpers';
import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import LoadingIndicator from '../ui/loading/LoadingIndicator';
import { showLongToast, showToast } from '../ui/Toast';
import PostUnit from './PostUnit';

const PostList = ({
	collectionName,
	filter,
	isAddPostButtonVisible = false,
	containerStyle,
}: PostListProps) => {
	const userInfo = useAuthStore((state) => state.userInfo);
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
	} = useInfinitePosts(collectionName, filter);

	const flatListData = data?.pages.flatMap((page) => page.data) ?? [];

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

		navigateToNewPost();
	};

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

			{isAddPostButtonVisible && (
				<TouchableOpacity
					style={styles.addPostButton}
					onPress={onPressAddPostButton}
				>
					<FontAwesome6 name='circle-plus' size={48} color={Colors.primary} />
				</TouchableOpacity>
			)}
		</>
	);
};

const styles = StyleSheet.create({
	endText: {
		textAlign: 'center',
		color: Colors.font_gray,
		marginVertical: 16,
	},
	addPostButton: {
		position: 'absolute',
		bottom: 20,
		right: 20,
		backgroundColor: 'white',
	},
});

export default PostList;
