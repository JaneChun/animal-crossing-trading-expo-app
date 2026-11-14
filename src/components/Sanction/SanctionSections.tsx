import { StyleSheet, View } from 'react-native';

import InfoRow from '@/components/Admin/InfoRow';
import Badge from '@/components/ui/Badge';
import Text from '@/components/ui/Text';
import { VIOLATION_TYPES } from '@/constants/sanction';
import { Spacing, Theme, useThemedStyles } from '@/theme';
import { Appeal, Sanction } from '@/types/sanction';
import { formatKstDate } from '@/utilities/kstDate';
import {
	getSanctionTargetKind,
	getSanctionTargetText,
	SUSPENSION_DAYS,
} from '@/utilities/sanction';

const TARGET_KIND_LABELS = { post: '게시글', comment: '댓글', chat: '채팅' } as const;

const getTargetLabel = (sanction: Sanction): string | null => {
	const targetKind = getSanctionTargetKind(sanction);
	if (!targetKind) return null;
	if (targetKind === 'chat') return TARGET_KIND_LABELS.chat;

	const targetText = getSanctionTargetText(sanction);
	return targetText
		? `${TARGET_KIND_LABELS[targetKind]} · ${targetText}`
		: TARGET_KIND_LABELS[targetKind];
};

// "2026.11.21 0시까지 (7일)", 영구 정지는 "영구"
const getPeriodLabel = (sanction: Sanction): string | null => {
	if (sanction.kind === 'permanent') return '영구';
	const days = SUSPENSION_DAYS[sanction.kind];
	if (!days || !sanction.suspendUntil) return null;
	return `${formatKstDate(sanction.suspendUntil.toDate())} 0시까지 (${days}일)`;
};

// 조치 내용: 위반 유형 / 대상 / 제한 기간(정지일 때)
export const SanctionSummarySection = ({ sanction }: { sanction: Sanction }) => {
	const styles = useThemedStyles(makeStyles);
	const violationLabel =
		VIOLATION_TYPES.find(({ EN }) => EN === sanction.violationType)?.KR ?? '';
	const targetLabel = getTargetLabel(sanction);
	const periodLabel = getPeriodLabel(sanction);

	const rows = [
		{
			label: '위반 유형',
			value: (
				<Text
					variant="body1"
					weight="bold"
					color="secondary"
					numberOfLines={1}
					style={styles.value}
				>
					{violationLabel}
				</Text>
			),
		},
		...(targetLabel ? [{ label: '대상', value: targetLabel }] : []),
		...(periodLabel ? [{ label: '제한 기간', value: periodLabel }] : []),
	];

	return (
		<View>
			<Text variant="body1" weight="semibold" style={styles.sectionTitle}>
				조치 내용
			</Text>
			{rows.map(({ label, value }, index) => (
				<InfoRow
					key={label}
					label={label}
					value={value}
					borderRound={
						rows.length === 1
							? 'all'
							: index === 0
								? 'top'
								: index === rows.length - 1
									? 'bottom'
									: undefined
					}
				/>
			))}
		</View>
	);
};

// 이의 신청: 상태 칩 + 접수일 + 내용(사용자 화면은 3줄, 관리자 화면은 전체)
export const AppealSection = ({
	appeal,
	showFullContent = false,
}: {
	appeal: Appeal;
	showFullContent?: boolean;
}) => {
	const styles = useThemedStyles(makeStyles);
	const isPending = appeal.status === 'pending';

	return (
		<View>
			<View style={[styles.titleRow, styles.sectionTitle]}>
				<Text variant="body1" weight="semibold">
					이의 신청
				</Text>
				<Badge
					text={isPending ? '검토 중' : '검토 완료'}
					tone={isPending ? 'brand' : 'neutral'}
				/>
			</View>
			<View style={styles.appealCard}>
				<Text variant="caption" color="tertiary">
					{`${formatKstDate(appeal.createdAt.toDate())} 접수`}
				</Text>
				<Text
					variant="body2"
					color="secondary"
					numberOfLines={showFullContent ? undefined : 3}
				>
					{appeal.content}
				</Text>
			</View>
		</View>
	);
};

// 결과 안내: 운영자 답변일 + 답변. 검토 완료된 이의 신청에만 그린다
// 재신청 불가 안내는 사용자 화면에만 보여 준다
export const AppealResultSection = ({
	appeal,
	showResubmitNotice = true,
}: {
	appeal: Appeal;
	showResubmitNotice?: boolean;
}) => {
	const styles = useThemedStyles(makeStyles);
	if (appeal.status !== 'reviewed') return null;

	return (
		<View>
			<Text variant="body1" weight="semibold" style={styles.sectionTitle}>
				결과 안내
			</Text>
			<View style={styles.resultCard}>
				{!!appeal.repliedAt && (
					<Text variant="caption" color="tertiary">
						{`${formatKstDate(appeal.repliedAt.toDate())} 운영자 답변`}
					</Text>
				)}
				<Text variant="body2" color="secondary">
					{appeal.reply}
				</Text>
			</View>
			{showResubmitNotice && (
				<Text variant="caption" color="tertiary" style={styles.resultNotice}>
					같은 조치에는 이의를 다시 신청할 수 없습니다.
				</Text>
			)}
		</View>
	);
};

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		sectionTitle: {
			marginBottom: Spacing.l,
		},
		titleRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
		},
		value: {
			flexShrink: 1,
		},
		appealCard: {
			padding: Spacing.l,
			borderRadius: 8,
			borderWidth: 1,
			borderColor: colors.border.default,
			gap: Spacing.s,
		},
		resultCard: {
			padding: Spacing.l,
			borderRadius: 10,
			backgroundColor: colors.bg.fill,
			gap: Spacing.s,
		},
		resultNotice: {
			marginTop: Spacing.m,
		},
	});
