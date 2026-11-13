import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import Gallery, { RenderItemInfo } from 'react-native-awesome-gallery';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BorderRadius, Spacing, Theme, useThemedStyles } from '@/theme';
import { ImageViewerModalProps } from '@/types/components';

import Text from './Text';

const FALLBACK_WIDTH = 400;
const FALLBACK_HEIGHT = 300;

const ImageViewerModal = ({
	visible,
	images,
	initialIndex = 0,
	onRequestClose,
}: ImageViewerModalProps) => {
	const styles = useThemedStyles(makeStyles);
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
					style={[styles.closeButton, { top: insets.top + Spacing.l }]}
					onPress={onRequestClose}
					hitSlop={8}
				>
					<Ionicons name="close-outline" color={styles.counterText.color} size={32} />
				</Pressable>

				{images.length > 1 && (
					<View style={[styles.counter, { top: insets.top + Spacing.l }]}>
						<Text variant="body2" weight="medium" style={styles.counterText}>
							{currentIndex + 1} / {images.length}
						</Text>
					</View>
				)}
			</View>
		</Modal>
	);
};

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.media.background,
		},
		closeButton: {
			position: 'absolute',
			left: Spacing.l,
			width: 32,
			height: 32,
			borderRadius: BorderRadius.full,
			backgroundColor: colors.overlay.dim,
			justifyContent: 'center',
			alignItems: 'center',
			zIndex: 10,
		},
		counter: {
			position: 'absolute',
			alignSelf: 'center',
			paddingHorizontal: Spacing.m,
			paddingVertical: Spacing.xs,
			borderRadius: BorderRadius.m,
			backgroundColor: colors.overlay.dim,
			zIndex: 10,
		},
		counterText: {
			color: colors.media.foreground,
		},
	});

export default ImageViewerModal;
