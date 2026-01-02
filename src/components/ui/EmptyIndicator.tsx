import { Colors } from '@/constants/Color';
import { FontSizes, FontWeights } from '@/constants/Typography';
import { EmptyIndicatorProps } from '@/types/components';
import {
	Entypo,
	Feather,
	FontAwesome,
	Ionicons,
	MaterialCommunityIcons,
	MaterialIcons,
} from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const ICON_MAP = {
	MaterialCommunityIcons,
	MaterialIcons,
	Entypo,
	Feather,
	FontAwesome,
	Ionicons,
} as const;

const EmptyIndicator = ({
	iconType = 'MaterialCommunityIcons',
	iconName = 'information-outline',
	message,
}: EmptyIndicatorProps) => {
	const IconComponent = ICON_MAP[iconType];

	return (
		<View style={styles.emptyContainer}>
			<View style={styles.emptyIcon}>
				<IconComponent name={iconName} size={72} color={Colors.icon_gray} />
			</View>
			<Text style={styles.emptyText}>{message}</Text>
		</View>
	);
};

export default EmptyIndicator;

const styles = StyleSheet.create({
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
	},
	emptyIcon: {
		marginBottom: 16,
	},
	emptyText: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.light,
		color: Colors.font_gray,
	},
});
