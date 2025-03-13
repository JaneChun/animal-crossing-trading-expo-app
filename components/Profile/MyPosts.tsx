import { Colors } from '@/constants/Color';
import useLoading from '@/hooks/useLoading';
import { MyPostsProps } from '@/types/components';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import PostUnit from '../Home/PostUnit';

const MyPosts = ({ data, isLoading, isEnd, loadMore }: MyPostsProps) => {
	const { InlineLoadingIndicator } = useLoading();

	return (
		<View style={styles.container}>
			<Text style={styles.title}>작성한 글</Text>

			<FlatList
				data={data}
				keyExtractor={({ id }) => id}
				renderItem={({ item }) => <PostUnit {...item} />}
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
