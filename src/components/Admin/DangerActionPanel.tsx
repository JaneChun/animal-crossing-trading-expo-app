import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import { Spacing, Theme, useThemedStyles } from '@/theme';

export type DangerAction = {
	title: string;
	description?: string;
	actionLabel: string;
	/** 되돌리는 동작은 dangerOutline, 새로 적용하는 동작은 danger */
	variant: 'danger' | 'dangerOutline';
	onPress: () => void;
	isLoading?: boolean;
	disabled?: boolean;
};

// 계정 정지·콘텐츠 숨기기 같은 관리자 조치를 bg.danger 면에 행으로 쌓는다
// 아직 적용되지 않은 조치만 있는 패널(정지 전 유저의 [정지])은 tone="neutral"로 bg.fill 면에 그린다
const DangerActionPanel = ({
	actions,
	tone = 'danger',
}: {
	actions: DangerAction[];
	tone?: 'danger' | 'neutral';
}) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={[styles.panel, tone === 'neutral' && styles.neutralPanel]}>
			{actions.map((action, index) => (
				<Fragment key={action.title}>
					{index > 0 && <View style={styles.divider} />}
					<View style={styles.row}>
						<View style={styles.texts}>
							<Text variant="body1">{action.title}</Text>
							{!!action.description && (
								<Text variant="caption" color="danger">
									{action.description}
								</Text>
							)}
						</View>
						<Button
							size="sm"
							variant={action.variant}
							onPress={action.onPress}
							isLoading={action.isLoading}
							disabled={action.disabled}
						>
							{action.actionLabel}
						</Button>
					</View>
				</Fragment>
			))}
		</View>
	);
};

export default DangerActionPanel;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		panel: {
			borderRadius: 10,
			overflow: 'hidden',
			backgroundColor: colors.bg.danger,
		},
		neutralPanel: {
			backgroundColor: colors.bg.fill,
		},
		row: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			gap: Spacing.m,
			padding: Spacing.l,
		},
		texts: {
			flex: 1,
		},
		divider: {
			height: 1,
			backgroundColor: colors.status.danger,
			opacity: 0.2,
		},
	});
