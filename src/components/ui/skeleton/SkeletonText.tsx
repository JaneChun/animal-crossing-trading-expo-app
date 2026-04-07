import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import SkeletonBox from './SkeletonBox';

type Props = {
	lines?: number;
	lineHeight?: number;
	lastLineWidth?: number | `${number}%`;
	style?: StyleProp<ViewStyle>;
};

const SkeletonText = ({ lines = 1, lineHeight = 14, lastLineWidth = '70%', style }: Props) => (
	<View style={[styles.container, style]}>
		{Array.from({ length: lines }).map((_, i) => (
			<SkeletonBox
				key={i}
				width={i === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
				height={lineHeight}
			/>
		))}
	</View>
);

const styles = StyleSheet.create({
	container: {
		gap: 6,
	},
});

export default SkeletonText;
