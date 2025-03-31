import { Colors } from '@/constants/Color';
import useGetPosts from '@/hooks/useGetPosts';
import useLoading from '@/hooks/useLoading';
import { useRefreshStore } from '@/stores/RefreshStore';
import { PostListProps } from '@/types/components';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
} from 'react-native';
import PostUnit from './PostUnit';

const PostList = ({
	collectionName,
	filter,
	isAddPostButtonVisible = false,
}: PostListProps) => {
	const navigation = useNavigation<any>();

	const { LoadingIndicator, InlineLoadingIndicator } = useLoading();
	const {
		data,
		isLoading: isFetching,
		isEnd,
		loadMore,
		refresh,
	} = useGetPosts(collectionName, filter, 10);
	const [isRefreshing, setIsRefreshing] = useState(false); // 새로고침 상태
	const { shouldRefreshPostList, setRefreshPostList } = useRefreshStore(
		(state) => state,
	);

	useFocusEffect(
		useCallback(() => {
			if (shouldRefreshPostList) {
				refresh();
				setRefreshPostList(false);
			}
		}, [shouldRefreshPostList]),
	);

	const onRefresh = useCallback(async () => {
		setIsRefreshing(true);
		await refresh();
	}, []);

	const onPressAddPostButton = () => {
		navigation.navigate('NewPost', {
			id: undefined,
			updatedCart: undefined,
		});
	};

	if (isFetching && data.length === 0) {
		return <LoadingIndicator />;
	}

	return (
		<>
			<FlatList
				data={data}
				keyExtractor={({ id }) => id}
				renderItem={({ item }) => <PostUnit {...item} />}
				refreshControl={
					<RefreshControl
						tintColor={Colors.border_gray}
						titleColor={Colors.primary}
						refreshing={isRefreshing}
						onRefresh={onRefresh}
					/>
				}
				onEndReached={!isEnd ? loadMore : undefined}
				onEndReachedThreshold={0.5}
				ListFooterComponent={
					isFetching ? (
						<InlineLoadingIndicator />
					) : isEnd ? (
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
