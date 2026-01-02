import { Colors } from '@/constants/Color';
import { FontSizes } from '@/constants/Typography';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ReadAllButton = ({ onPress }: { onPress: () => void }) => {
	return (
		<View style={styles.container}>
			<TouchableOpacity onPress={onPress}>
				<Text style={styles.text}>모두 읽음</Text>
			</TouchableOpacity>
		</View>
	);
};

export default ReadAllButton;

const styles = StyleSheet.create({
	container: {
		padding: 16,
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
	text: {
		color: Colors.font_gray,
		fontSize: FontSizes.xs,
	},
});
