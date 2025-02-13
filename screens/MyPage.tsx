import { useAuthContext } from '@/contexts/AuthContext';
import { StyleSheet } from 'react-native';
import Profile from '@/components/MyPage/Profile';
import MyPosts from '@/components/MyPage/MyPosts';
import { FlatList } from 'react-native-gesture-handler';
import useLoading from '@/hooks/useLoading';

const MyPage = () => {
	const { userInfo } = useAuthContext();
	const { LoadingIndicator } = useLoading();

	if (!userInfo) {
		return <LoadingIndicator />;
	}

	return (
		<FlatList
			style={styles.container}
			data={[]}
			renderItem={null}
			ListHeaderComponent={<Profile />}
			ListEmptyComponent={<MyPosts />}
		></FlatList>
	);
};

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		padding: 24,
		backgroundColor: 'white',
	},
});

export default MyPage;
