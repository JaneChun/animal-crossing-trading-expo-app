import { ImageViewerModalProps } from '@/types/components';
import React, { useCallback, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Gallery, { RenderItemInfo } from 'react-native-awesome-gallery';
import { Ionicons } from '@expo/vector-icons';

const FALLBACK_WIDTH = 400;
const FALLBACK_HEIGHT = 300;

const ImageViewerModal = ({
	visible,
	images,
	initialIndex = 0,
	onRequestClose,
}: ImageViewerModalProps) => {
	const insets = useSafeAreaInsets();
	const [currentIndex, setCurrentIndex] = useState(initialIndex);

	const renderItem = useCallback(({ item, setImageDimensions }: RenderItemInfo<string>) => {
		Image.getSize(
			item,
			(width, height) => {
				setImageDimensions({ width, height });
			},
			() => {
				setImageDimensions({ width: FALLBACK_WIDTH, height: FALLBACK_HEIGHT });
			},
		);

		return (
			<Image
				source={{ uri: item }}
				style={StyleSheet.absoluteFillObject}
				resizeMode="contain"
			/>
		);
	}, []);

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
			<View style={styles.container}>
				<Gallery
					data={images}
					initialIndex={initialIndex}
					renderItem={renderItem}
					onSwipeToClose={onRequestClose}
					onIndexChange={setCurrentIndex}
					keyExtractor={(item, index) => `${item}-${index}`}
				/>

				<Pressable
					style={[styles.closeButton, { top: insets.top + 16 }]}
					onPress={onRequestClose}
					hitSlop={8}
				>
					<Ionicons name="close-outline" color="white" size={32} />
				</Pressable>

				{images.length > 1 && (
					<View style={[styles.counter, { top: insets.top + 16 }]}>
						<Text style={styles.counterText}>
							{currentIndex + 1} / {images.length}
						</Text>
					</View>
				)}
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black',
	},
	closeButton: {
		position: 'absolute',
		left: 16,
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 10,
	},
	counter: {
		position: 'absolute',
		alignSelf: 'center',
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 12,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		zIndex: 10,
	},
	counterText: {
		color: 'white',
		fontSize: 14,
		fontWeight: '500',
	},
});

export default ImageViewerModal;
