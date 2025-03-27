import { Colors } from '@/constants/Color';
import { useAuthStore } from '@/stores/AuthStore';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PostList from '../Home/PostList';

const MyPosts = () => {
	const userInfo = useAuthStore((state) => state.userInfo);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>작성한 글</Text>
			<PostList collectionName='Boards' filter={{ creatorId: userInfo?.uid }} />
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
