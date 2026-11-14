import { MaterialIcons } from '@expo/vector-icons';
import { ComponentProps, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import Text from '@/components/ui/Text';
import { BorderRadius, ColorScheme, Theme, ToneColorKey, useTheme, useThemedStyles } from '@/theme';

export type StatStripItem = {
	label: string;
	value: string;
	/** 숫자 위 원형 아이콘 */
	icon?: { name: ComponentProps<typeof MaterialIcons>['name']; tone: ToneColorKey };
	/** 숫자 앞 아이콘 */
	inlineIcon?: ReactNode;
	valueTone?: keyof ColorScheme['text'];
};

// 테두리 박스 안에 2~5칸의 숫자를 나란히 보여 준다
const StatStrip = ({ items }: { items: StatStripItem[] }) => {
	const { colors } = useTheme();
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={styles.strip}>
			{items.map(({ label, value, icon, inlineIcon, valueTone }, index) => (
				<View key={label} style={[styles.cell, index > 0 && styles.cellDivider]}>
					{icon && (
						<View
							style={[styles.iconCircle, { backgroundColor: colors.bg[icon.tone] }]}
						>
							<MaterialIcons
								name={icon.name}
								size={16}
								color={colors.text[icon.tone]}
							/>
						</View>
					)}
					<View style={styles.valueRow}>
						{inlineIcon}
						<Text
							variant={icon ? 'body1' : 'heading'}
							weight="bold"
							color={valueTone ?? 'primary'}
						>
							{value}
						</Text>
					</View>
					<Text variant="caption" color="tertiary">
						{label}
					</Text>
				</View>
			))}
		</View>
	);
};

export default StatStrip;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		strip: {
			flexDirection: 'row',
			paddingVertical: 14,
			borderRadius: BorderRadius.s,
			borderWidth: 1,
			borderColor: colors.border.default,
		},
		cell: {
			flex: 1,
			alignItems: 'center',
		},
		cellDivider: {
			borderLeftWidth: 1,
			borderLeftColor: colors.border.default,
		},
		iconCircle: {
			width: 28,
			height: 28,
			marginBottom: 6,
			borderRadius: BorderRadius.full,
			alignItems: 'center',
			justifyContent: 'center',
		},
		valueRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
		},
	});
