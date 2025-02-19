import { Colors } from '@/constants/Color';
import useGetPosts from '@/hooks/useGetPosts';
import useLoading from '@/hooks/useLoading';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import PostUnit from '../components/Home/PostUnit';

const Home = () => {
	const { LoadingIndicator, InlineLoadingIndicator } = useLoading();
	const { data, isLoading, isEnd, loadMore, refresh } = useGetPosts({}, 10);
	const [isRefreshing, setIsRefreshing] = useState(false); // 새로고침 상태

	useFocusEffect(
		useCallback(() => {
			refresh();
		}, []),
	);

	const onRefresh = useCallback(async () => {
		setIsRefreshing(true);
		await refresh();
		setIsRefreshing(false);
	}, []);

	if (isLoading && data.length === 0) {
		return <LoadingIndicator />;
	}

	return (
		<View style={styles.container}>
			<Text style={styles.header}>거래글</Text>

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
		padding: 16,
		backgroundColor: 'white',
	},
	header: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 8,
		color: Colors.font_black,
	},
	endText: {
		textAlign: 'center',
		color: Colors.font_gray,
		marginVertical: 16,
	},
});

export default Home;
