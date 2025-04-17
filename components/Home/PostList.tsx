import { Colors } from '@/constants/Color';
import { useInfinitePosts } from '@/hooks/query/post/useInfinitePosts';
import { PostListProps } from '@/types/components';
import { FontAwesome6 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import LoadingIndicator from '../ui/LoadingIndicator';
import PostUnit from './PostUnit';

const PostList = ({
	collectionName,
	filter,
	isAddPostButtonVisible = false,
	containerStyle,
}: PostListProps) => {
	const navigation = useNavigation<any>();

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
		navigation.navigate('NewPost', {
			id: undefined,
			updatedCart: undefined,
		});
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
