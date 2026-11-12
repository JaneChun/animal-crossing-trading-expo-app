import { StyleSheet, View } from 'react-native';

import Text from '@/components/ui/Text';
import { Theme, useThemedStyles } from '@/theme';
import { TabBarLabelProps } from '@/types/components';

const TabBarLabel = ({ label, hasUnread }: TabBarLabelProps) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={styles.container}>
			<Text variant="body2" weight="semibold" style={styles.label}>
				{label}
			</Text>
			{hasUnread && <View style={styles.badge} />}
		</View>
	);
};

export default TabBarLabel;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		container: {
			flexDirection: 'row',
			alignItems: 'center',
		},
		label: {
			color: colors.brand.primary,
		},
		badge: {
			width: 7,
			height: 7,
			borderRadius: 4,
			backgroundColor: colors.status.danger,
			marginLeft: 4,
			position: 'absolute',
			top: -2,
			right: -11,
		},
	});
