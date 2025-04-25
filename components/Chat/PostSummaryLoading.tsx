import { Colors } from '@/constants/Color';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ThreeDotsLoadingIndicator from '../ui/loading/ThreeDotsLoadingIndicator';

const PostSummaryLoading = () => {
	return (
		<View style={styles.container}>
			<ThreeDotsLoadingIndicator />
		</View>
	);
};

export default PostSummaryLoading;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 16,
		height: 70,
		borderColor: Colors.border_gray,
		borderWidth: 1,
		backgroundColor: 'white',
		borderRadius: 8,
	},
});
