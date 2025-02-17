import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PostUnit from '../Home/PostUnit';
import { useAuthContext } from '@/contexts/AuthContext';
import useLoading from '@/hooks/useLoading';
import { Colors } from '@/constants/Color';
import useGetPosts from '@/hooks/useGetPosts';
import { FlatList } from 'react-native-gesture-handler';

const MyPosts = () => {
	const { userInfo } = useAuthContext();
	const { LoadingIndicator, InlineLoadingIndicator } = useLoading();
	const { data, isLoading, isEnd, loadMore } = useGetPosts(
		{ creatorId: userInfo?.uid },
		5,
	);

	if (isLoading && data.length === 0) {
		return <LoadingIndicator />;
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>작성한 글</Text>

			<FlatList
				data={data}
				keyExtractor={({ id }) => id}
				renderItem={({ item }) => (
					<PostUnit
						id={item.id}
						type={item.type}
						title={item.title}
						previewImage={item.images?.[0]}
						createdAt={item.createdAt}
						creatorDisplayName={item.creatorDisplayName}
						creatorId={item.creatorId}
						// comments={item.comments}
						// done={item.done}
					/>
				)}
				onEndReached={!isEnd ? loadMore : undefined}
				onEndReachedThreshold={0.5}
				ListFooterComponent={
					isLoading ? (
						<InlineLoadingIndicator />
					) : isEnd ? (
						<Text style={styles.endText}>마지막 글입니다.</Text>
					) : null
				}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		marginTop: 24,
		marginBottom: 8,
	},
	endText: {
		textAlign: 'center',
		color: Colors.font_gray,
		marginVertical: 16,
	},
});

export default MyPosts;
