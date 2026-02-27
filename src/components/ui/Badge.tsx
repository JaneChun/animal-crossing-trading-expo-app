import { StyleSheet, Text, View } from 'react-native';

import { FontSizes, FontWeights } from '@/constants/Typography';
import { BadgeProps } from '@/types/components';

const Badge = ({ text, textColor, bgColor, containerStyle }: BadgeProps) => {
	return (
		<View style={containerStyle}>
			<Text style={[styles.badge, { color: textColor, backgroundColor: bgColor }]}>
				{text}
			</Text>
		</View>
	);
};

export default Badge;

const styles = StyleSheet.create({
	badge: {
		marginRight: 6,
		paddingVertical: 4,
		paddingHorizontal: 5,
		borderRadius: 4,
		fontSize: FontSizes.xs,
		fontWeight: FontWeights.semibold,
	},
});
