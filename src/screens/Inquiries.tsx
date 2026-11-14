import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import Badge from '@/components/ui/Badge';
import EmptyIndicator from '@/components/ui/EmptyIndicator';
import { PADDING } from '@/components/ui/layout/Layout';
import LoadingIndicator from '@/components/ui/loading/LoadingIndicator';
import Text from '@/components/ui/Text';
import { SANCTION_KINDS, VIOLATION_TYPES } from '@/constants/sanction';
import { useMySanctions } from '@/hooks/sanction/query/useMySanctions';
import { useUserInfo } from '@/stores/auth';
import { Spacing, Theme, useTheme, useThemedStyles } from '@/theme';
import { Sanction } from '@/types/sanction';
import { formatKstDate } from '@/utilities/kstDate';
import { navigateToInquiryDetail } from '@/utilities/navigationHelpers';
import { getSanctionTargetText } from '@/utilities/sanction';

// 문의 내역: 받은 조치와 각 이의 신청 상태를 탭 없이 칩으로 구분한 한 목록
const Inquiries = () => {
	const styles = useThemedStyles(makeStyles);
	const userInfo = useUserInfo();
	const { data: sanctions, isLoading } = useMySanctions(userInfo?.uid);

	if (isLoading) return <LoadingIndicator />;

	return (
		<FlatList
			style={styles.screen}
			contentContainerStyle={styles.content}
			data={sanctions ?? []}
			keyExtractor={({ id }) => id}
			renderItem={({ item }) => <InquiryRow sanction={item} />}
			ItemSeparatorComponent={() => <View style={styles.separator} />}
			ListEmptyComponent={<EmptyIndicator message="문의 내역이 없습니다." />}
		/>
	);
};

const InquiryRow = ({ sanction }: { sanction: Sanction }) => {
	const styles = useThemedStyles(makeStyles);
	const { colors } = useTheme();
	const kindLabel = SANCTION_KINDS.find(({ EN }) => EN === sanction.kind)?.KR ?? '';
	const violationLabel = VIOLATION_TYPES.find(({ EN }) => EN === sanction.violationType)?.KR;
	const targetText = getSanctionTargetText(sanction);
	const appeal = sanction.appeal;

	return (
		<Pressable
			style={styles.row}
			onPress={() => navigateToInquiryDetail(sanction.id)}
		>
			<View style={styles.texts}>
				<View style={styles.chips}>
					<Badge
						text={kindLabel}
						tone={sanction.kind === 'warning' ? 'orange' : 'danger'}
					/>
					{appeal && (
						<Badge
							text={appeal.status === 'pending' ? '검토 중' : '검토 완료'}
							tone={appeal.status === 'pending' ? 'brand' : 'neutral'}
						/>
					)}
				</View>
				<Text variant="body2">{violationLabel}</Text>
				{!!targetText && (
					<Text variant="body2" color="tertiary" numberOfLines={1}>
						{targetText}
					</Text>
				)}
				<Text variant="caption" color="tertiary">
					{formatKstDate(sanction.createdAt.toDate())}
				</Text>
			</View>
			<Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
		</Pressable>
	);
};

export default Inquiries;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		content: {
			flexGrow: 1,
			paddingHorizontal: PADDING,
		},
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.m,
			paddingVertical: Spacing.l,
		},
		texts: {
			flex: 1,
			minWidth: 0,
			gap: Spacing.xxs,
		},
		chips: {
			flexDirection: 'row',
			gap: Spacing.xs,
			marginBottom: Spacing.xs,
		},
		separator: {
			height: 1,
			backgroundColor: colors.border.default,
		},
	});
