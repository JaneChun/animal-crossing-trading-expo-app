import { StyleSheet, View } from 'react-native';

import Text from '@/components/ui/Text';
import { BorderRadius, ColorScheme, Spacing, Theme, useThemedStyles } from '@/theme';

type StatTileProps = {
	label: string;
	value: number;
	unit: string;
	/** 위험도를 나타내는 숫자 색 */
	valueTone?: keyof ColorScheme['text'];
};

const StatTile = ({ label, value, unit, valueTone = 'primary' }: StatTileProps) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={styles.tile}>
			<Text variant="caption" color="tertiary">
				{label}
			</Text>
			<Text variant="heading" weight="bold" color={valueTone}>
				{value.toLocaleString('ko-KR')}
				<Text variant="body2" weight="medium">
					{` ${unit}`}
				</Text>
			</Text>
		</View>
	);
};

export default StatTile;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		tile: {
			flex: 1,
			paddingVertical: 10,
			paddingHorizontal: Spacing.m,
			borderRadius: BorderRadius.s,
			backgroundColor: colors.bg.fill,
		},
	});
