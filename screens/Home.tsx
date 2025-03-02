import PostUnit from '@/components/Home/PostUnit';
import Layout from '@/components/ui/Layout';
import { Colors } from '@/constants/Color';
import useGetPosts from '@/hooks/useGetPosts';
import useLoading from '@/hooks/useLoading';
import { HomeStackNavigation } from '@/types/navigation';
import { FontAwesome6 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';

const Home = () => {
	const { LoadingIndicator, InlineLoadingIndicator } = useLoading();
	const {
		data,
		isLoading: isFetching,
		isEnd,
		loadMore,
		refresh,
	} = useGetPosts({}, 10);
	const [isRefreshing, setIsRefreshing] = useState(false); // 새로고침 상태
	const navigation = useNavigation<HomeStackNavigation>();

	useFocusEffect(
		useCallback(() => {
			refresh();
		}, []),
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
					isFetching ? (
						<InlineLoadingIndicator />
					) : isEnd ? (
						<Text style={styles.endText}>마지막 글입니다.</Text>
					) : null
				}
			/>
			<TouchableOpacity
				style={styles.addPostButton}
				onPress={onPressAddPostButton}
			>
				<FontAwesome6 name='circle-plus' size={48} color={Colors.primary} />
			</TouchableOpacity>
		</Layout>
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

export default Home;
