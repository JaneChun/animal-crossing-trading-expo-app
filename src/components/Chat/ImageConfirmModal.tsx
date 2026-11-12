import { FontAwesome6 } from '@expo/vector-icons';
import { ImagePickerAsset } from 'expo-image-picker';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Theme, useThemedStyles } from '@/theme';

interface ImageConfirmModalProps {
	visible: boolean;
	image: ImagePickerAsset | null;
	onSend: () => void;
	onClose: () => void;
}

const ImageConfirmModal = ({ visible, image, onSend, onClose }: ImageConfirmModalProps) => {
	const styles = useThemedStyles(makeStyles);
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
						<FontAwesome6
							name="chevron-left"
							size={24}
							color={styles.closeIcon.color}
						/>
					</Pressable>
					<Pressable style={styles.sendButton} onPress={onSend} testID="sendImageButton">
						<FontAwesome6
							name="circle-arrow-up"
							size={36}
							color={styles.sendIcon.color}
							style={styles.arrowIcon}
						/>
					</Pressable>
				</View>
			</View>
		</Modal>
	);
};

export default ImageConfirmModal;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.media.background,
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
			backgroundColor: colors.text.onBrand,
			width: 36,
			height: 36,
			borderRadius: 18,
			justifyContent: 'center',
			alignItems: 'center',
		},
		arrowIcon: {
			position: 'absolute',
		},
		closeIcon: {
			color: colors.media.foreground,
		},
		sendIcon: {
			color: colors.brand.primary,
		},
	});
