import { Colors } from '@/constants/Color';
import { useImagePicker } from '@/hooks/shared/useImagePicker';
import { ImageInputProps } from '@/types/components';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import ImageWithFallback from '../ui/ImageWithFallback';

const ImageInput = ({
	images,
	setImages,
	containerStyle,
	labelStyle,
}: ImageInputProps) => {
	const { pickImage } = useImagePicker({ multiple: true });

	const addImage = async () => {
		const newImages = await pickImage();

		if (newImages) {
			setImages((currentImages) => [...currentImages, ...newImages]);
		}
	};

	const deleteImage = (uri: string) => {
		setImages((currentImages) =>
			currentImages.filter((image) => image.uri !== uri),
		);
	};

	return (
		<View style={containerStyle}>
			<Text style={labelStyle}>사진</Text>

			<FlatList
				data={images}
				horizontal
				style={styles.flatListContainer}
				ListHeaderComponent={
					<TouchableOpacity
						style={[styles.addImageButtonContainer, styles.imageContainer]}
						activeOpacity={0.5}
						onPress={addImage}
					>
						<MaterialIcons
							name='photo-library'
							color={Colors.font_gray}
							size={48}
						/>
						<View style={styles.textContainer}>
							<Text style={styles.currentCountText}>{images.length}</Text>
							<Text style={styles.totalCountText}> / 10</Text>
						</View>
					</TouchableOpacity>
				}
				renderItem={({ item: image }) => (
					<>
						<View key={image.uri}>
							<TouchableOpacity
								style={styles.deleteButton}
								onPress={() => deleteImage(image.uri)}
								activeOpacity={0.7}
							>
								<Text style={styles.deleteButtonIcon}>✕</Text>
							</TouchableOpacity>
							<ImageWithFallback
								uri={image?.uri}
								fallbackSource={require('../../assets/images/image-not-found.png')}
								style={styles.imageContainer}
							/>
						</View>
					</>
				)}
			></FlatList>
		</View>
	);
};

export default ImageInput;

const styles = StyleSheet.create({
	flatListContainer: {
		paddingBottom: 16,
	},
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
