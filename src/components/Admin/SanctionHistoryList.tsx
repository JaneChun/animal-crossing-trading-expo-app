import { StyleSheet, View } from 'react-native';

import Badge from '@/components/ui/Badge';
import Text from '@/components/ui/Text';
import { SANCTION_KINDS, VIOLATION_TYPES } from '@/constants/sanction';
import { Spacing, Theme, useThemedStyles } from '@/theme';
import { BadgeTone } from '@/types/components';
import { Sanction } from '@/types/sanction';
import { formatKstDate, formatKstMonthDay } from '@/utilities/kstDate';

const SANCTION_COUNT_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

type SanctionState = 'active' | 'expired' | 'canceled';

// 만료(조치일 + 90일 경과)는 저장하지 않고 날짜로 계산한다
// 영구 정지는 90일이 지나도 정지가 계속되므로 만료로 표시하지 않는다
const getSanctionState = (sanction: Sanction): SanctionState => {
	if (sanction.status === 'canceled') return 'canceled';
	if (sanction.kind === 'permanent') return 'active';
	const isExpired = sanction.createdAt.toMillis() + SANCTION_COUNT_WINDOW_MS < Date.now();
	return isExpired ? 'expired' : 'active';
};

const getChip = (sanction: Sanction, state: SanctionState): { text: string; tone: BadgeTone } => {
	if (state === 'canceled') return { text: '취소', tone: 'neutral' };
	if (state === 'expired') return { text: '만료', tone: 'neutral' };

	const kindLabel = SANCTION_KINDS.find(({ EN }) => EN === sanction.kind)?.KR ?? '';
	return { text: kindLabel, tone: sanction.kind === 'warning' ? 'orange' : 'danger' };
};

// 대상 콘텐츠 스냅샷의 제목(게시글) 또는 본문(댓글·답글)
const getTargetTitle = (sanction: Sanction): string | undefined => {
	const snapshot = sanction.target?.snapshot;
	return snapshot?.title || snapshot?.body;
};

// 관리자 유저 상세의 제재 이력. 행은 조치 칩 / 위반 유형 / 대상 글 / 날짜
const SanctionHistoryList = ({ sanctions }: { sanctions: Sanction[] }) => {
	const styles = useThemedStyles(makeStyles);

	return (
		<View style={styles.list}>
			{sanctions.map((sanction, index) => {
				const state = getSanctionState(sanction);
				const isInactive = state !== 'active';
				const chip = getChip(sanction, state);
				const violationLabel = VIOLATION_TYPES.find(
					({ EN }) => EN === sanction.violationType,
				)?.KR;
				const targetTitle = getTargetTitle(sanction);
				const createdAt = sanction.createdAt.toDate();
				const dateText = isInactive
					? formatKstDate(createdAt)
					: formatKstMonthDay(createdAt);

				return (
					<View key={sanction.id} style={[styles.row, index > 0 && styles.rowDivider]}>
						<Badge text={chip.text} tone={chip.tone} />
						<View style={styles.texts}>
							<Text variant="body2" color={isInactive ? 'tertiary' : 'primary'}>
								{violationLabel}
							</Text>
							{!!targetTitle && (
								<Text variant="body2" color="tertiary" numberOfLines={1}>
									{targetTitle}
								</Text>
							)}
							<Text variant="caption" color="tertiary">
								{dateText}
							</Text>
						</View>
					</View>
				);
			})}
		</View>
	);
};

export default SanctionHistoryList;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		list: {
			borderRadius: 8,
			borderWidth: 1,
			borderColor: colors.border.default,
		},
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.m,
			padding: Spacing.l,
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
