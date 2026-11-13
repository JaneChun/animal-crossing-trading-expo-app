import { Ionicons } from '@expo/vector-icons';
import { ReactElement } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

import { Theme, useTheme, useThemedStyles } from '@/theme';

const SettingListItem = ({
	children,
	borderRound,
	onPress,
	showChevron = false,
	style = {},
	testID = '',
}: {
	children: ReactElement;
	borderRound?: 'top' | 'bottom' | 'all';
	onPress?: () => void;
	showChevron?: boolean;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}) => {
	const { colors } = useTheme();
	const styles = useThemedStyles(makeStyles);
	return (
		<TouchableOpacity
			testID={testID}
			style={[
				styles.row,
				borderRound === 'top' && styles.topRow,
				borderRound === 'bottom' && styles.bottomRow,
				borderRound === 'all' && [styles.topRow, styles.bottomRow],
				style,
			]}
			onPress={onPress}
			disabled={!onPress}
		>
			{children}
			{showChevron && (
				<Ionicons name="chevron-forward" size={20} color={colors.text.primary} />
			)}
		</TouchableOpacity>
	);
};

export default SettingListItem;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		row: {
			padding: 16,
			borderTopWidth: 1,
			borderColor: colors.border.onFill,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			backgroundColor: colors.bg.fill,
		},
		topRow: {
			borderTopWidth: 0,
			borderTopLeftRadius: 10,
			borderTopRightRadius: 10,
		},
		bottomRow: {
			borderBottomLeftRadius: 10,
			borderBottomRightRadius: 10,
		},
	});
