import { Colors } from '@/constants/Color';
import { TabBarLabelProps } from '@/types/components';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
		fontSize: 14,
		fontWeight: 600,
		color: Colors.primary,
	},
	badge: {
		width: 7,
		height: 7,
		borderRadius: 4,
		backgroundColor: Colors.badge_red,
		marginLeft: 4,
		position: 'absolute',
		top: -2,
		right: -11,
	},
});
