import { Colors } from '@/constants/Color';
import { useAuthStore } from '@/stores/AuthStore';
import React from 'react';
import { StyleSheet } from 'react-native';
import PostList from '../Home/PostList';
import Layout, { PADDING } from '../ui/Layout';

const MyPosts = () => {
	const userInfo = useAuthStore((state) => state.userInfo);

	return (
		<Layout title='작성한 글'>
			<PostList
				collectionName='Boards'
				filter={{ creatorId: userInfo?.uid }}
				containerStyle={{ paddingHorizontal: PADDING }}
			/>
		</Layout>
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
