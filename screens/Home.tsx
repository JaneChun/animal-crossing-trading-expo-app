import PostUnit from '@/components/Home/PostUnit';
import Layout from '@/components/ui/Layout';
import { Colors } from '@/constants/Color';
import useGetPosts from '@/hooks/useGetPosts';
import useLoading from '@/hooks/useLoading';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';

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
	}, []);

	if (isLoading && data.length === 0) {
		return <LoadingIndicator />;
	}

	return (
		<Layout title='거래글'>
			<FlatList
				data={data}
				keyExtractor={({ id }) => id}
				renderItem={({ item }) => (
					<PostUnit {...item} previewImage={item.images?.[0]} />
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
		</Layout>
	);
};

const styles = StyleSheet.create({
	endText: {
		textAlign: 'center',
		color: Colors.font_gray,
		marginVertical: 16,
	},
});

export default Home;
