declare module 'react-native-snap-carousel' {
	import { Component } from 'react';
	import { FlatListProps, ViewStyle } from 'react-native';

	interface CarouselProps<T> extends FlatListProps<T> {
		data: T[];
		renderItem: ({ item, index }: { item: T; index: number }) => JSX.Element;
		sliderWidth: number;
		itemWidth: number;
		loop?: boolean;
		autoplay?: boolean;
		containerCustomStyle?: ViewStyle;
		contentContainerCustomStyle?: ViewStyle;
		inactiveSlideScale?: number;
		inactiveSlideOpacity?: number;
		enableSnap?: boolean;
	}

	export default class Carousel<T> extends Component<CarouselProps<T>> {}
}
