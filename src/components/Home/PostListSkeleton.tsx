import { StyleSheet, View } from 'react-native';

import PostUnitSkeleton from './PostUnitSkeleton';
import { PADDING } from '../ui/layout/Layout';

const SKELETON_COUNT = 8;

const PostListSkeleton = () => (
	<View style={styles.container}>
		{Array.from({ length: SKELETON_COUNT }).map((_, i) => (
			<PostUnitSkeleton key={i} />
		))}
	</View>
);

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: PADDING,
	},
});

export default PostListSkeleton;
