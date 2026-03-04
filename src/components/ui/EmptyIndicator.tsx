import {
	Entypo,
	Feather,
	FontAwesome,
	Ionicons,
	MaterialCommunityIcons,
	MaterialIcons,
} from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { FontSizes, FontWeights } from '@/constants/Typography';
import { Colors } from '@/theme/Color';
import { EmptyIndicatorProps } from '@/types/components';

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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const IconComponent = ICON_MAP[iconType] as React.ComponentType<any>;

	return (
		<View style={styles.emptyContainer}>
			<View style={styles.emptyIcon}>
				<IconComponent name={iconName} size={72} color={Colors.text.tertiary} />
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
		backgroundColor: Colors.bg.primary,
	},
	emptyIcon: {
		marginBottom: 16,
	},
	emptyText: {
		fontSize: FontSizes.md,
		fontWeight: FontWeights.light,
		color: Colors.text.tertiary,
	},
});
