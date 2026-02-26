import { Ionicons } from '@expo/vector-icons';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

import { Colors } from '@/theme/Color';

const SettingListItem = ({
	children,
	borderRound,
	onPress,
	showChevron = false,
	style = {},
	testID = '',
}: {
	children: JSX.Element;
	borderRound?: 'top' | 'bottom' | 'all';
	onPress?: () => void;
	showChevron?: boolean;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}) => {
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
				<Ionicons name="chevron-forward" size={20} color={Colors.text.primary} />
			)}
		</TouchableOpacity>
	);
};

export default SettingListItem;

const styles = StyleSheet.create({
	row: {
		padding: 16,
		borderTopWidth: 1,
		borderColor: Colors.border.default,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: Colors.bg.secondary,
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
