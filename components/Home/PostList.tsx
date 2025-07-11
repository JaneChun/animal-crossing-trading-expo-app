import { Colors } from '@/constants/Color';
import { auth } from '@/fbase';
import { useInfinitePosts } from '@/hooks/post/query/useInfinitePosts';
import { useUserInfo } from '@/stores/auth';
import { PostListProps } from '@/types/components';
import {
	navigateToLogin,
	navigateToMyProfile,
	navigateToNewPost,
} from '@/utilities/navigationHelpers';
import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import LoadingIndicator from '../ui/loading/LoadingIndicator';
import { showLongToast, showToast } from '../ui/Toast';
import PostUnit from './PostUnit';

const PostList = ({
	collectionName,
	filter,
	isAddPostButtonVisible = false,
	containerStyle,
}: PostListProps) => {
	const userInfo = useUserInfo();
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
				<Pressable
					style={styles.addPostButton}
					onPress={onPressAddPostButton}
					testID='addPostButton'
				>
					<FontAwesome6 name='circle-plus' size={48} color={Colors.primary} />
					<View style={styles.whiteBackground} />
				</Pressable>
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
		backgroundColor: 'white',
		borderRadius: '50%',
	},
});

export default PostList;
