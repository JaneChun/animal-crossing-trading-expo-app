import { Colors } from '@/constants/Color';
import { PageIndicatorProps } from '@/types/components';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const PageIndicator = ({ totalPages, currentIndex }: PageIndicatorProps) => {
	return (
		<View style={styles.indicatorContainer}>
			{Array.from({ length: totalPages }).map((_, index) => (
				<View
					key={index}
					style={[
						styles.indicatorDot,
						currentIndex === index ? styles.activeDot : styles.inactiveDot,
					]}
				/>
			))}
		</View>
	);
};

export default PageIndicator;

const styles = StyleSheet.create({
	indicatorContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 32,
		gap: 8,
	},
	indicatorDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	activeDot: {
		backgroundColor: Colors.primary,
	},
	inactiveDot: {
		backgroundColor: Colors.icon_gray,
	},
});
