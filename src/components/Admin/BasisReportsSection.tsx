import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import Text from '@/components/ui/Text';
import { Spacing, Theme, useTheme, useThemedStyles } from '@/theme';
import { Report } from '@/types/report';
import { formatKstMonthDay } from '@/utilities/kstDate';
import { navigateToAdminReportDetail } from '@/utilities/navigationHelpers';

import { getReportCategoryBadge } from './reportMeta';

type BasisReportsSectionProps = {
	reports: Report[];
	description?: string;
	/** 신고 상세에서 지금 보는 신고. 이동하지 않고 "지금 보는 신고"로 표시한다 */
	currentReportId?: string;
};

// 근거 신고 N건: 신고 상세 내용 1줄 + "{카테고리} · {MM.DD}" + ›. 누르면 신고 상세로 간다
const BasisReportsSection = ({
	reports,
	description,
	currentReportId,
}: BasisReportsSectionProps) => {
	const styles = useThemedStyles(makeStyles);
	const { colors } = useTheme();

	return (
		<View>
			<Text variant="body1" weight="semibold">
				{`근거 신고 ${reports.length}건`}
			</Text>
			{!!description && (
				<Text variant="caption" color="tertiary" style={styles.description}>
					{description}
				</Text>
			)}
			{reports.map((report, index) => {
				const isCurrent = report.id === currentReportId;
				const metaTexts = [
					getReportCategoryBadge(report.category).text,
					formatKstMonthDay(report.createdAt.toDate()),
					...(isCurrent ? ['지금 보는 신고'] : []),
				];

				return (
					<Pressable
						key={report.id}
						style={[styles.row, index > 0 && styles.rowDivider]}
						disabled={isCurrent}
						onPress={() => navigateToAdminReportDetail({ reportId: report.id })}
					>
						<View style={styles.texts}>
							<Text
								variant="body2"
								color={report.detail ? 'primary' : 'tertiary'}
								numberOfLines={1}
							>
								{report.detail || '상세 내용 없음'}
							</Text>
							<Text variant="caption" color="tertiary">
								{metaTexts.join(' · ')}
							</Text>
						</View>
						{!isCurrent && (
							<Ionicons
								name="chevron-forward"
								size={16}
								color={colors.text.tertiary}
							/>
						)}
					</Pressable>
				);
			})}
		</View>
	);
};

export default BasisReportsSection;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		description: {
			marginTop: Spacing.xs,
		},
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.s,
			paddingVertical: Spacing.m,
		},
		rowDivider: {
			borderTopWidth: 1,
			borderColor: colors.border.default,
		},
		texts: {
			flex: 1,
			minWidth: 0,
		},
	});
