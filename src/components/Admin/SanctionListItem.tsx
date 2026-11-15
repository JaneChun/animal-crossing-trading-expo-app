import { Pressable, StyleSheet, View } from 'react-native';

import Badge from '@/components/ui/Badge';
import Text from '@/components/ui/Text';
import { SANCTION_KINDS, SANCTION_REVIEW_STAGES, VIOLATION_TYPES } from '@/constants/sanction';
import { useCachedPublicUserInfo } from '@/hooks/shared/useCachedPublicUserInfo';
import { BorderRadius, Spacing, Theme, useThemedStyles } from '@/theme';
import { BadgeTone } from '@/types/components';
import { Sanction } from '@/types/sanction';
import { formatKstDate, formatKstMonthDay } from '@/utilities/kstDate';
import { navigateToAdminSanctionDetail } from '@/utilities/navigationHelpers';

import ContentTypeChip from './ContentTypeChip';
import { getReportContentType } from './reportMeta';

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

type SanctionListItemProps = {
	sanction: Sanction;
	/** 아랫줄 오른쪽에 보여 줄 정보. 신고·조치 관리 목록은 유저 이름, 유저 조치 이력·연결된 조치는 현재 단계 */
	meta: 'user' | 'stage';
};

// 조치 목록 행: 조치 칩 + 위반 유형 + 날짜 / 대상 제목(답변 필요면 이의 신청 내용) / 대상 종류 + 유저 이름 또는 단계
const SanctionListItem = ({ sanction, meta }: SanctionListItemProps) => {
	const styles = useThemedStyles(makeStyles);
	const { data: user } = useCachedPublicUserInfo(meta === 'user' ? sanction.userId : null);

	const state = getSanctionState(sanction);
	const isInactive = state !== 'active';
	const chip = getChip(sanction, state);
	const violationLabel = VIOLATION_TYPES.find(({ EN }) => EN === sanction.violationType)?.KR;
	const stageLabel = SANCTION_REVIEW_STAGES.find(({ EN }) => EN === sanction.reviewStage)?.KR;

	const pendingAppeal = sanction.appeal?.status === 'pending' ? sanction.appeal : null;
	const createdAt = sanction.createdAt.toDate();
	const sanctionDateText = isInactive ? formatKstDate(createdAt) : formatKstMonthDay(createdAt);
	const dateText = pendingAppeal
		? `${formatKstMonthDay(pendingAppeal.createdAt.toDate())} 접수`
		: sanctionDateText;
	const bodyText = pendingAppeal ? pendingAppeal.content : getTargetTitle(sanction);

	return (
		<Pressable
			style={styles.item}
			onPress={() => navigateToAdminSanctionDetail({ sanctionId: sanction.id })}
		>
			<View style={styles.topRow}>
				<View style={styles.badges}>
					<Badge text={chip.text} tone={chip.tone} />
					<Text variant="body2" weight="semibold" color="secondary">
						{violationLabel}
					</Text>
				</View>
				<Text variant="caption" color="tertiary">
					{dateText}
				</Text>
			</View>
			{!!bodyText && (
				<Text
					variant="body1"
					color={isInactive ? 'tertiary' : 'primary'}
					numberOfLines={pendingAppeal ? 2 : 1}
				>
					{bodyText}
				</Text>
			)}
			<View style={styles.bottomRow}>
				{sanction.target && (
					<ContentTypeChip type={getReportContentType(sanction.target)} />
				)}
				{meta === 'user' && (
					<Text variant="body2" color="secondary" numberOfLines={1}>
						{user?.displayName}
					</Text>
				)}
				{meta === 'stage' && !!stageLabel && (
					<View style={styles.stagePill}>
						<Text variant="caption" weight="semibold" color="secondary">
							{stageLabel}
						</Text>
					</View>
				)}
			</View>
		</Pressable>
	);
};

export default SanctionListItem;

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
			gap: 6,
		},
		bottomRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.s,
			marginTop: Spacing.xxs,
		},
		stagePill: {
			marginLeft: 'auto',
			paddingVertical: Spacing.xs,
			paddingHorizontal: Spacing.s,
			borderRadius: BorderRadius.full,
			backgroundColor: colors.bg.fill,
		},
	});
