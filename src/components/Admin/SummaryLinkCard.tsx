import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import Text from '@/components/ui/Text';
import { BorderRadius, Spacing, Theme, useTheme, useThemedStyles } from '@/theme';

type SummaryLinkCardProps = {
	/** 타입 배지 또는 참여자 아바타 */
	left: ReactNode;
	title: string;
	onPress: () => void;
};

// PostSummary 모양의 이동 카드 (원문 게시글, 신고된 채팅)
const SummaryLinkCard = ({ left, title, onPress }: SummaryLinkCardProps) => {
	const { colors } = useTheme();
	const styles = useThemedStyles(makeStyles);

	return (
		<Pressable style={styles.card} onPress={onPress}>
			{left}
			<Text variant="body1" weight="semibold" numberOfLines={1} style={styles.title}>
				{title}
			</Text>
			<Ionicons name="arrow-forward-circle-outline" size={24} color={colors.brand.primary} />
		</Pressable>
	);
};

export default SummaryLinkCard;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		card: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Spacing.m,
			height: 70,
			paddingHorizontal: Spacing.l,
			borderRadius: BorderRadius.s,
			backgroundColor: colors.bg.fill,
		},
		title: {
			flex: 1,
		},
	});
