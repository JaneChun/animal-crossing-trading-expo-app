import { StyleSheet, Text, View } from 'react-native';

import { FontSizes, FontWeights } from '@/constants/Typography';
import { Colors } from '@/theme/Color';
import { TabBarLabelProps } from '@/types/components';

const TabBarLabel = ({ label, hasUnread }: TabBarLabelProps) => {
	return (
		<View style={styles.container}>
			<Text style={styles.label}>{label}</Text>
			{hasUnread && <View style={styles.badge} />}
		</View>
	);
};

export default TabBarLabel;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	label: {
		fontSize: FontSizes.sm,
		fontWeight: FontWeights.semibold,
		color: Colors.brand.primary,
	},
	badge: {
		width: 7,
		height: 7,
		borderRadius: 4,
		backgroundColor: Colors.badge.red,
		marginLeft: 4,
		position: 'absolute',
		top: -2,
		right: -11,
	},
});
