import { Colors } from '@/constants/Color';
import { AddImageButtonProps } from '@/types/components';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AddImageButton = ({
	count,
	totalCount,
	onPress,
}: AddImageButtonProps) => {
	return (
		<TouchableOpacity
			style={[styles.addImageButtonContainer, styles.imageContainer]}
			activeOpacity={0.5}
			onPress={onPress}
		>
			<MaterialIcons name='photo-library' color={Colors.font_gray} size={48} />
			<View style={styles.textContainer}>
				<Text style={styles.currentCountText}>{count}</Text>
				<Text style={styles.totalCountText}> / {totalCount}</Text>
			</View>
		</TouchableOpacity>
	);
};

export default AddImageButton;

const styles = StyleSheet.create({
	imageContainer: {
		width: 100,
		height: 100,
		margin: 6,
		borderRadius: 12,
	},
	addImageButtonContainer: {
		padding: 8,
		backgroundColor: Colors.base,
		borderWidth: 1,
		borderColor: Colors.border_gray,
		justifyContent: 'center',
		alignItems: 'center',
	},
	textContainer: {
		fontSize: 14,
		flexDirection: 'row',
		marginTop: 4,
	},
	currentCountText: {
		color: Colors.primary,
		fontWeight: 'bold',
	},
	totalCountText: {
		color: Colors.font_gray,
		fontWeight: 'semibold',
	},
});
