import { MaterialIcons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import Text from '@/components/ui/Text';
import { BorderRadius, Spacing, Theme, ToneColorKey, useTheme, useThemedStyles } from '@/theme';

type StatCardProps = {
	label: string;
	value: string;
	icon: ComponentProps<typeof MaterialIcons>['name'];
	tone: ToneColorKey;
	/** 전일 대비 증감. 0이거나 없으면 추세를 표시하지 않는다 */
	delta?: number;
};

const StatCard = ({ label, value, icon, tone, delta }: StatCardProps) => {
	const { colors } = useTheme();
	const styles = useThemedStyles(makeStyles);
	const hasDelta = delta !== undefined && delta !== 0;
	// 증가는 빨강, 감소는 파랑 (사용자 지시)
	const deltaColor = (delta ?? 0) > 0 ? colors.status.danger : colors.status.info;

	return (
		<View style={styles.card}>
			<View style={[styles.iconCircle, { backgroundColor: colors.bg[tone] }]}>
				<MaterialIcons name={icon} size={18} color={colors.text[tone]} />
			</View>
			<View>
				<Text variant="body2" color="tertiary">
					{label}
				</Text>
				<View style={styles.valueRow}>
					<Text variant="display" weight="bold">
						{value}
					</Text>
					{hasDelta && (
						<View style={styles.delta}>
							<MaterialIcons
								name={delta > 0 ? 'trending-up' : 'trending-down'}
								size={18}
								color={deltaColor}
							/>
							<Text variant="caption" weight="bold" style={{ color: deltaColor }}>
								{Math.abs(delta).toLocaleString('ko-KR')}
							</Text>
						</View>
					)}
				</View>
			</View>
		</View>
	);
};

export default StatCard;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		card: {
			flex: 1,
			gap: 10,
			padding: Spacing.l,
			borderRadius: BorderRadius.m,
			backgroundColor: colors.bg.fill,
		},
		iconCircle: {
			width: 32,
			height: 32,
			borderRadius: BorderRadius.full,
			alignItems: 'center',
			justifyContent: 'center',
		},
		valueRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
		},
		delta: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.xxs,
		},
	});
