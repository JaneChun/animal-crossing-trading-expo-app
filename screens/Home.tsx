import { FlatList, StyleSheet, Text, View } from 'react-native';
import PostUnit from '../components/Home/PostUnit';
import { Colors } from '@/constants/Color';
import useLoading from '@/hooks/useLoading';
import useGetPosts from '@/hooks/useGetPosts';

const Home = () => {
	const { LoadingIndicator, InlineLoadingIndicator } = useLoading();
	const { data, isLoading, isEnd, loadMore } = useGetPosts({}, 10);

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
