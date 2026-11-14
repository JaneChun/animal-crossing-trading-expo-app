import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AdminGuard from '@/components/Admin/AdminGuard';
import { getReportCategoryBadge } from '@/components/Admin/reportMeta';
import {
	AppealResultSection,
	AppealSection,
	SanctionSummarySection,
} from '@/components/Sanction/SanctionSections';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import Text from '@/components/ui/Text';
import { useDecideAppeal } from '@/hooks/admin/mutation/useDecideAppeal';
import { useAdminSanction, useSanctionReports } from '@/hooks/admin/query/useAdminSanction';
import { FontSizes, Spacing, Theme, useTheme, useThemedStyles } from '@/theme';
import { AdminAppealDetailRouteProp } from '@/types/navigation';
import { AppealResult } from '@/types/sanction';
import { formatKstMonthDay } from '@/utilities/kstDate';
import { navigateToAdminReportDetail } from '@/utilities/navigationHelpers';

const AdminAppealDetail = () => {
	const { params } = useRoute<AdminAppealDetailRouteProp>();

	return (
		<AdminGuard>
			<AppealDetailContent sanctionId={params.sanctionId} />
		</AdminGuard>
	);
};

// 이의 신청 검토: 조치 내용·이의 신청·결과 안내(답변 입력)·근거 신고, [조치 유지]/[조치 취소]
const AppealDetailContent = ({ sanctionId }: { sanctionId: string }) => {
	const styles = useThemedStyles(makeStyles);
	const { colors } = useTheme();
	const [reply, setReply] = useState('');
	const { data: sanction, isLoading } = useAdminSanction(sanctionId);
	const { data: reports } = useSanctionReports(sanctionId, sanction?.reportIds);
	const {
		mutate: decideAppeal,
		isPending,
		variables,
	} = useDecideAppeal({
		sanctionId,
		userId: sanction?.userId ?? '',
	});

	if (isLoading) return <LoadingIndicator />;
	if (!sanction) return <EmptyIndicator message="조치를 찾을 수 없습니다." />;

	const appeal = sanction.appeal;
	const isPendingAppeal = appeal?.status === 'pending';
	const trimmedReply = reply.trim();

	const decide = (result: AppealResult) => decideAppeal({ result, reply: trimmedReply });

	return (
		<SafeAreaView style={styles.screen} edges={['bottom']}>
			<ScrollView keyboardShouldPersistTaps="handled">
				<View style={styles.sections}>
					<SanctionSummarySection sanction={sanction} />
					{appeal && <AppealSection appeal={appeal} showFullContent />}
					{appeal && !isPendingAppeal && (
						<AppealResultSection appeal={appeal} showResubmitNotice={false} />
					)}
					{isPendingAppeal && (
						<View>
							<Text variant="body1" weight="semibold" style={styles.sectionTitle}>
								결과 안내
							</Text>
							<View style={styles.replyCard}>
								<Text variant="caption" color="tertiary">
									운영자 답변 · 사용자에게 그대로 표시됩니다
								</Text>
								<TextInput
									style={styles.replyInput}
									value={reply}
									onChangeText={setReply}
									placeholder="검토 결과와 이유를 적어 주세요."
									placeholderTextColor={colors.text.tertiary}
									multiline
								/>
							</View>
						</View>
					)}
				</View>

				{!!reports?.length && (
					<>
						<Divider variant="section" />
						<View style={styles.reportsSection}>
							<Text variant="body1" weight="semibold">
								{`근거 신고 ${reports.length}건`}
							</Text>
							{reports.map((report, index) => (
								<Pressable
									key={report.id}
									style={[styles.reportRow, index > 0 && styles.reportRowDivider]}
									onPress={() =>
										navigateToAdminReportDetail({ reportId: report.id })
									}
								>
									<View style={styles.reportTexts}>
										<Text
											variant="body2"
											color={report.detail ? 'primary' : 'tertiary'}
											numberOfLines={1}
										>
											{report.detail || '상세 내용 없음'}
										</Text>
										<Text variant="caption" color="tertiary">
											{`${getReportCategoryBadge(report.category).text} · ${formatKstMonthDay(report.createdAt.toDate())}`}
										</Text>
									</View>
									<Ionicons
										name="chevron-forward"
										size={16}
										color={colors.text.tertiary}
									/>
								</Pressable>
							))}
						</View>
					</>
				)}
			</ScrollView>

			{isPendingAppeal && (
				<View style={styles.footer}>
					<Text variant="caption" color="tertiary">
						조치를 취소하면 정지가 해제되고 글이 다시 공개되며, 이 조치는 위반 횟수에서
						빠집니다.
					</Text>
					<View style={styles.buttons}>
						<Button
							variant="secondary"
							size="lg"
							flex
							disabled={!trimmedReply || isPending}
							isLoading={isPending && variables?.result === 'upheld'}
							onPress={() => decide('upheld')}
						>
							조치 유지
						</Button>
						<Button
							size="lg"
							flex
							disabled={!trimmedReply || isPending}
							isLoading={isPending && variables?.result === 'canceled'}
							onPress={() => decide('canceled')}
						>
							조치 취소
						</Button>
					</View>
				</View>
			)}
		</SafeAreaView>
	);
};

export default AdminAppealDetail;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		sections: {
			padding: PADDING,
			gap: Spacing.xxl,
		},
		sectionTitle: {
			marginBottom: Spacing.l,
		},
		replyCard: {
			padding: Spacing.l,
			borderRadius: 10,
			backgroundColor: colors.bg.fill,
			gap: Spacing.s,
		},
		replyInput: {
			height: 96,
			padding: 0,
			color: colors.text.primary,
			fontSize: FontSizes.sm,
			lineHeight: 20,
			textAlignVertical: 'top',
		},
		reportsSection: {
			padding: PADDING,
		},
		reportRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.s,
			paddingVertical: Spacing.m,
		},
		reportRowDivider: {
			borderTopWidth: 1,
			borderColor: colors.border.default,
		},
		reportTexts: {
			flex: 1,
			minWidth: 0,
		},
		footer: {
			paddingHorizontal: PADDING,
			paddingTop: Spacing.m,
			paddingBottom: Spacing.s,
			gap: Spacing.s,
			borderTopWidth: 1,
			borderColor: colors.border.default,
		},
		buttons: {
			flexDirection: 'row',
			gap: Spacing.s,
		},
	});
