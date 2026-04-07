import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/theme/Color';

type Props = {
	width?: number | `${number}%`;
	height?: number;
	borderRadius?: number;
	style?: StyleProp<ViewStyle>;
};

const DURATION = 1800;
const SHIMMER_RATIO = 0.4;
const MIN_SHIMMER_WIDTH = 60;

const SkeletonBox = ({ width, height, borderRadius = 4, style }: Props) => {
	const translateX = useSharedValue(0);
	const [containerWidth, setContainerWidth] = useState(0);

	const shimmerWidth =
		containerWidth > 0
			? Math.max(MIN_SHIMMER_WIDTH, containerWidth * SHIMMER_RATIO)
			: MIN_SHIMMER_WIDTH;

	const handleLayout = (e: LayoutChangeEvent) => {
		setContainerWidth(e.nativeEvent.layout.width);
	};

	useEffect(() => {
		if (containerWidth === 0) return;

		const shimmerW = Math.max(MIN_SHIMMER_WIDTH, containerWidth * SHIMMER_RATIO);
		translateX.value = -shimmerW;
		translateX.value = withRepeat(
			withTiming(containerWidth, { duration: DURATION, easing: Easing.linear }),
			-1,
			false,
		);
	}, [containerWidth, translateX]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	return (
		<View
			onLayout={handleLayout}
			style={[
				{
					width,
					height,
					borderRadius,
					backgroundColor: Colors.bg.tertiary,
					overflow: 'hidden',
				},
				style,
			]}
		>
			<Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
				<LinearGradient
					colors={[Colors.bg.tertiary, '#fafafa', Colors.bg.tertiary]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					style={{ width: shimmerWidth, height: '100%' }}
				/>
			</Animated.View>
		</View>
	);
};

export default SkeletonBox;
