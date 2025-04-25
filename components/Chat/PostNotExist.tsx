import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const PostNotExist = () => {
	return (
		<View style={styles.container}>
			<Feather name='alert-circle' color={Colors.font_gray} size={16} />
			<Text style={styles.invalidPostText}>삭제된 게시글입니다.</Text>
		</View>
	);
};

export default PostNotExist;

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
		gap: 6,
	},
	invalidPostText: {
		color: Colors.font_gray,
		alignSelf: 'center',
		fontWeight: FontWeights.regular,
		fontSize: FontSizes.sm,
	},
});
