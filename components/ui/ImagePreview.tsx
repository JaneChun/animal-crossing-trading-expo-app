import { ImagePreviewProps } from '@/types/components';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ImageWithFallback from './ImageWithFallback';

const ImagePreview = ({ uri, onDelete }: ImagePreviewProps) => {
	return (
		<>
			<View key={uri}>
				<TouchableOpacity
					style={styles.deleteButton}
					onPress={() => onDelete(uri)}
					activeOpacity={0.7}
				>
					<Text style={styles.deleteButtonIcon}>✕</Text>
				</TouchableOpacity>
				<ImageWithFallback
					uri={uri}
					fallbackSource={require('../../assets/images/image-not-found.png')}
					style={styles.imageContainer}
				/>
			</View>
		</>
	);
};

export default ImagePreview;

const styles = StyleSheet.create({
	imageContainer: {
		width: 100,
		height: 100,
		margin: 6,
		borderRadius: 12,
	},
	deleteButton: {
		position: 'absolute',
		zIndex: 2,
		top: 0,
		right: 0,
		backgroundColor: 'black',
		borderRadius: 12,
		width: 24,
		height: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	deleteButtonIcon: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
});
