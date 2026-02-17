import { Colors } from '@/constants/Color';
import { ImagePickerAsset } from 'expo-image-picker';
import React from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';

interface ImageConfirmModalProps {
	visible: boolean;
	image: ImagePickerAsset | null;
	onSend: () => void;
	onClose: () => void;
}

const ImageConfirmModal = ({ visible, image, onSend, onClose }: ImageConfirmModalProps) => {
	const insets = useSafeAreaInsets();

	if (!image) return null;

	return (
		<Modal visible={visible} animationType="slide" onRequestClose={onClose}>
			<View style={styles.container}>
				{/* 이미지 미리보기 */}
				<View style={[styles.imageContainer, { paddingTop: insets.top }]}>
					<Image source={{ uri: image.uri }} style={styles.image} resizeMode="contain" />
				</View>

				{/* 하단 버튼 영역 */}
				<View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
					<Pressable onPress={onClose} hitSlop={12} testID="closeImageConfirm">
						<FontAwesome6 name="chevron-left" size={24} color="white" />
					</Pressable>
					<Pressable style={styles.sendButton} onPress={onSend} testID="sendImageButton">
						<FontAwesome6 name="circle-arrow-up" size={36} color={Colors.primary} />
					</Pressable>
				</View>
			</View>
		</Modal>
	);
};

export default ImageConfirmModal;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
	},
	imageContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	image: {
		width: '100%',
		height: '100%',
	},
	footer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 16,
	},
	sendButton: {
		backgroundColor: 'white',
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
