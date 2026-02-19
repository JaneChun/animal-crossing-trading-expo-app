import { ImageCarouselProps } from '@/types/components';
import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import ImageViewerModal from '@/components/ui/ImageViewerModal';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { Colors } from '@/constants/Color';

const { width } = Dimensions.get('window');

const ImageCarousel = ({ images, containerStyle }: ImageCarouselProps) => {
	const [activeIndex, setActiveIndex] = useState(0);
	const [isViewerOpen, setIsViewerOpen] = useState(false);

	const handleImagePress = (index: number) => {
		setActiveIndex(index);
		setIsViewerOpen(true);
	};

	if (!images || images.length === 0) return null;

	return (
		<View style={containerStyle}>
			<View style={styles.carouselWrapper}>
				<Carousel
					data={images}
					renderItem={({ item, index }) => (
						<Pressable onPress={() => handleImagePress(index)}>
							<ImageWithFallback
								uri={item as string}
								fallbackSource={require('../../../assets/images/image-not-found.png')}
								style={styles.image}
							/>
						</Pressable>
					)}
					sliderWidth={width}
					itemWidth={width * 0.85}
					onSnapToItem={(index) => setActiveIndex(index)}
					inactiveSlideScale={0.95}
					containerCustomStyle={{ marginStart: -20 }}
				/>
				<Pagination
					dotsLength={images.length}
					activeDotIndex={activeIndex}
					containerStyle={{ paddingVertical: 10 }}
					dotStyle={{
						width: 8,
						height: 8,
						backgroundColor: Colors.primary,
					}}
					inactiveDotOpacity={0.4}
					inactiveDotScale={0.8}
					animatedTension={10}
				/>

				{isViewerOpen && (
					<ImageViewerModal
						visible={isViewerOpen}
						images={images}
						initialIndex={activeIndex}
						onRequestClose={() => setIsViewerOpen(false)}
					/>
				)}
			</View>
		</View>
	);
};

export default ImageCarousel;

const styles = StyleSheet.create({
	carouselWrapper: {
		position: 'relative',
	},
	image: {
		width: '100%',
		height: 250,
		borderRadius: 10,
		marginBottom: 10,
	},
});
