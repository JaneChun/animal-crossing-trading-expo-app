import { ImagePreviewProps } from '@/types/components';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import ImageWithFallback from './ImageWithFallback';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Color';

const ImagePreview = ({ uri, onDelete }: ImagePreviewProps) => {
	return (
		<View>
			<Pressable
				style={styles.deleteButton}
				onPress={() => onDelete(uri)}
				hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
			>
				<Ionicons
					name="close-circle"
					size={20}
					color={Colors.font_gray}
					style={styles.deleteButtonIcon}
				/>
				<View style={styles.deleteButtonBackground} />
			</Pressable>
			<ImageWithFallback
				uri={uri}
				fallbackSource={require('../../../assets/images/image-not-found.png')}
				style={styles.imageContainer}
			/>
		</View>
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
		top: 10,
		right: 10,
		borderRadius: 10,
	},
	deleteButtonIcon: {
		zIndex: 2,
	},
	deleteButtonBackground: {
		position: 'absolute',
		zIndex: 1,
		width: 16,
		height: 16,
		top: 2,
		right: 2,
		borderRadius: 10,
		backgroundColor: 'white',
	},
});
