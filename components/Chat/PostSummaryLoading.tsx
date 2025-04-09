import { Colors } from '@/constants/Color';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const PostSummaryLoading = () => {
	return (
		<View style={styles.container}>
			<Image
				source={require('../../assets/images/three_dots.gif')}
				style={styles.image}
			/>
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
	image: {
		aspectRatio: 3,
		width: '40%',
	},
});
