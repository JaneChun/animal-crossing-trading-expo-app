import { StyleSheet, View } from 'react-native';

import { BorderRadius, Spacing, Theme, useThemedStyles } from '@/theme';
import { PageIndicatorProps } from '@/types/components';

const PageIndicator = ({ totalPages, currentIndex }: PageIndicatorProps) => {
	const styles = useThemedStyles(makeStyles);

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

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		indicatorContainer: {
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
			paddingVertical: Spacing.xxxl,
			gap: Spacing.s,
		},
		indicatorDot: {
			width: 8,
			height: 8,
			borderRadius: BorderRadius.full,
		},
		activeDot: {
			backgroundColor: colors.brand.primary,
		},
		inactiveDot: {
			backgroundColor: colors.icon.default,
		},
	});
