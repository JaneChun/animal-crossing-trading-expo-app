import { StyleSheet, View } from 'react-native';

import Text from '@/components/ui/Text';
import { Spacing, Theme, useThemedStyles } from '@/theme';

export type ProgressStep = {
	title: string;
	description?: string;
	state: 'done' | 'current' | 'todo';
};

// 세로 진행 단계. 완료는 브랜드 원 + ✓, 현재는 브랜드 테두리 + 번호, 남은 단계는 회색 원 + 번호
const ProgressSteps = ({ steps }: { steps: ProgressStep[] }) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View>
			{steps.map(({ title, description, state }, index) => {
				const isLast = index === steps.length - 1;
				return (
					<View key={title} style={styles.step}>
						<View style={styles.rail}>
							<View
								style={[
									styles.dot,
									state === 'done' && styles.doneDot,
									state === 'current' && styles.currentDot,
								]}
							>
								<Text
									variant="caption"
									weight="bold"
									color={
										state === 'done'
											? 'onBrand'
											: state === 'current'
												? 'primaryBrand'
												: 'tertiary'
									}
								>
									{state === 'done' ? '✓' : String(index + 1)}
								</Text>
							</View>
							{!isLast && (
								<View style={[styles.line, state === 'done' && styles.doneLine]} />
							)}
						</View>
						<View style={styles.texts}>
							<Text
								variant="body1"
								weight={state === 'todo' ? 'regular' : 'semibold'}
								color={state === 'todo' ? 'tertiary' : 'primary'}
							>
								{title}
							</Text>
							{!!description && (
								<Text variant="caption" color="tertiary">
									{description}
								</Text>
							)}
						</View>
					</View>
				);
			})}
		</View>
	);
};

export default ProgressSteps;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		step: {
			flexDirection: 'row',
			gap: Spacing.m,
		},
		rail: {
			alignItems: 'center',
		},
		dot: {
			width: 24,
			height: 24,
			borderRadius: 12,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.bg.fill,
		},
		doneDot: {
			backgroundColor: colors.brand.primary,
		},
		currentDot: {
			backgroundColor: colors.bg.primary,
			borderWidth: 2,
			borderColor: colors.brand.primary,
		},
		line: {
			flex: 1,
			width: 2,
			minHeight: 20,
			backgroundColor: colors.border.default,
		},
		doneLine: {
			backgroundColor: colors.brand.primary,
		},
		texts: {
			flex: 1,
			paddingBottom: Spacing.l,
		},
	});
