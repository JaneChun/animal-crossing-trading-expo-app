import { Colors } from '@/constants/Color';
import useGetPosts from '@/hooks/useGetPosts';
import useLoading from '@/hooks/useLoading';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';

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
};

const styles = StyleSheet.create({
	endText: {
		textAlign: 'center',
		color: Colors.font_gray,
		marginVertical: 16,
	},
});

export default Home;
