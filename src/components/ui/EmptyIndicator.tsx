import {
	Entypo,
	Feather,
	FontAwesome,
	Ionicons,
	MaterialCommunityIcons,
	MaterialIcons,
} from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Spacing, Theme, useThemedStyles } from '@/theme';
import { EmptyIndicatorProps } from '@/types/components';

import Text from './Text';

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
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={styles.emptyContainer}>
			<View style={styles.emptyIcon}>
				<IconComponent name={iconName} size={72} color={styles.emptyText.color} />
			</View>
			<Text variant="body1" weight="light" style={styles.emptyText}>{message}</Text>
		</View>
	);
};

export default EmptyIndicator;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		emptyContainer: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: colors.bg.primary,
		},
		emptyIcon: {
			marginBottom: Spacing.l,
		},
		emptyText: {
			color: colors.text.tertiary,
		},
	});
