import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import Badge from '@/components/ui/Badge';
import Text from '@/components/ui/Text';
import { useCachedPublicUserInfo } from '@/hooks/shared/useCachedPublicUserInfo';
import { Spacing, Theme, useThemedStyles } from '@/theme';
import { Report } from '@/types/report';
import { elapsedTime } from '@/utilities/elapsedTime';
import { navigateToAdminReportDetail } from '@/utilities/navigationHelpers';

import ContentTypeChip from './ContentTypeChip';
import { getReportCategoryBadge, getReportContentType } from './reportMeta';

type ReportListItemProps = {
	report: Report;
	/** 처리 완료 신고에 "처리완료" 배지를 붙인다. 처리 상태가 섞인 유저별 신고 내역에서 켠다 */
	showResolvedBadge?: boolean;
};

const ReportListItem = ({ report, showResolvedBadge = false }: ReportListItemProps) => {
	const styles = useThemedStyles(makeStyles);
	const { data: reporter } = useCachedPublicUserInfo(report.reporterId);
	const { data: reportee } = useCachedPublicUserInfo(report.reporteeId);
	const categoryBadge = getReportCategoryBadge(report.category);

	return (
		<Pressable
			style={styles.item}
			onPress={() => navigateToAdminReportDetail({ reportId: report.id })}
		>
			<View style={styles.topRow}>
				<View style={styles.badges}>
					<Badge text={categoryBadge.text} tone={categoryBadge.tone} />
					<ContentTypeChip type={getReportContentType(report)} />
					{showResolvedBadge && report.resolved && (
						<Badge text="처리완료" tone="neutral" />
					)}
				</View>
				<Text variant="caption" color="tertiary">
					{elapsedTime(report.createdAt)}
				</Text>
			</View>
			{!!report.detail && (
				<Text variant="body1" numberOfLines={2}>
					{report.detail}
				</Text>
			)}
			<View style={styles.users}>
				<Text variant="body2" color="tertiary" numberOfLines={1}>
					{reporter?.displayName}
				</Text>
				<Ionicons
					name="arrow-forward"
					size={12}
					color={styles.arrow.color}
					accessibilityLabel="가"
				/>
				<Text variant="body2" weight="semibold" color="secondary" numberOfLines={1}>
					{reportee?.displayName}
				</Text>
			</View>
		</Pressable>
	);
};

export default ReportListItem;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		item: {
			gap: 6,
			paddingVertical: Spacing.m,
			borderBottomWidth: 1,
			borderBottomColor: colors.border.default,
		},
		topRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		badges: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.s,
		},
		users: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.xs,
			marginTop: Spacing.xxs,
		},
		arrow: {
			color: colors.text.tertiary,
		},
	});
