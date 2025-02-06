import { Colors } from '@/constants/Color';
import React from 'react';
import { useState } from 'react';
import { Dimensions, Image, StyleSheet, View, ViewStyle } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';

type ImageCarouselProps = {
	images: string[];
	containerStyle: ViewStyle;
};
const { width, height } = Dimensions.get('window');

const ImageCarousel = ({ images, containerStyle }: ImageCarouselProps) => {
	const [activeIndex, setActiveIndex] = useState(0);

	return (
		<View style={containerStyle}>
			{images && (
				<>
					<Carousel
						data={images}
						renderItem={({ item }) => (
							<Image source={{ uri: item as string }} style={styles.image} />
						)}
						sliderWidth={width}
						itemWidth={width * 0.8}
						onSnapToItem={(index) => setActiveIndex(index)}
						inactiveSlideScale={0.95}
						containerCustomStyle={{
							marginStart: -30,
						}}
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
				</>
			)}
		</View>
	);
};

export default ImageCarousel;

const styles = StyleSheet.create({
	image: {
		width: '100%',
		height: 250,
		borderRadius: 10,
		marginBottom: 10,
	},
});
