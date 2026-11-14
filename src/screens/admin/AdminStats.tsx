import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ComponentProps, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import AdminGuard from '@/components/Admin/AdminGuard';
import StatCard from '@/components/Admin/StatCard';
import { PADDING } from '@/components/ui/layout/Layout';
import Text from '@/components/ui/Text';
import { useDailyStats } from '@/hooks/admin/query/useDailyStats';
import { Spacing, Theme, ToneColorKey, useTheme, useThemedStyles } from '@/theme';
import { DailyStats } from '@/types/admin';
import { addDaysToDateString, getKstDateString } from '@/utilities/kstDate';

type StatKey = Exclude<keyof DailyStats, 'date'>;
type StatCardSpec = {
	key: StatKey;
	label: string;
	icon: ComponentProps<typeof MaterialIcons>['name'];
	tone: ToneColorKey;
};

const STAT_GROUPS: { title: string; cards: StatCardSpec[] }[] = [
	{
		title: '활동',
		cards: [
			{ key: 'posts', label: '게시글', icon: 'article', tone: 'blue' },
			{ key: 'comments', label: '댓글', icon: 'mode-comment', tone: 'green' },
			{ key: 'replies', label: '답글', icon: 'reply', tone: 'lavender' },
			{ key: 'messages', label: '채팅 메시지', icon: 'textsms', tone: 'primaryBrand' },
		],
	},
	{
		title: '유저',
		cards: [
			{ key: 'signUps', label: '신규 가입', icon: 'person-add', tone: 'orange' },
			{ key: 'reviews', label: '리뷰', icon: 'star', tone: 'yellow' },
		],
	},
];

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// "11월 14일 (금)"
const toDateLabel = (date: string) => {
	const utcDate = new Date(`${date}T00:00:00Z`);
	return `${utcDate.getUTCMonth() + 1}월 ${utcDate.getUTCDate()}일 (${WEEKDAYS[utcDate.getUTCDay()]})`;
};

// 2개씩 한 줄로 묶는다
const chunkPairs = <T,>(items: T[]): T[][] =>
	items.reduce<T[][]>((rows, item, index) => {
		if (index % 2 === 0) rows.push([item]);
		else rows[rows.length - 1].push(item);
		return rows;
	}, []);

const AdminStats = () => {
	return (
		<AdminGuard>
			<StatsContent />
		</AdminGuard>
	);
};

const StatsContent = () => {
	const { colors } = useTheme();
	const styles = useThemedStyles(makeStyles);
	const today = getKstDateString(new Date());
	const [date, setDate] = useState(today);
	const isToday = date === today;

	// 전일 대비 증감을 위해 전날 통계도 함께 조회한다
	const { data: stats } = useDailyStats(date);
	const { data: previousStats } = useDailyStats(addDaysToDateString(date, -1));

	return (
		<ScrollView style={styles.screen} contentContainerStyle={styles.content}>
			<View style={styles.dateNav}>
				<Pressable
					style={styles.navButton}
					onPress={() => setDate(addDaysToDateString(date, -1))}
					accessibilityLabel="이전 날짜"
				>
					<Ionicons name="chevron-back" size={24} color={colors.text.primary} />
				</Pressable>
				<Text variant="heading" weight="semibold">
					{toDateLabel(date)}
				</Text>
				<Pressable
					style={styles.navButton}
					onPress={() => setDate(addDaysToDateString(date, 1))}
					disabled={isToday}
					accessibilityLabel="다음 날짜"
				>
					<Ionicons
						name="chevron-forward"
						size={24}
						color={isToday ? colors.icon.default : colors.text.primary}
					/>
				</Pressable>
			</View>

			{STAT_GROUPS.map((group) => (
				<View key={group.title} style={styles.group}>
					<Text variant="body1" weight="semibold" style={styles.groupTitle}>
						{group.title}
					</Text>
					{chunkPairs(group.cards).map((pair) => (
						<View key={pair[0].key} style={styles.cardRow}>
							{pair.map(({ key, label, icon, tone }) => {
								const value = stats?.[key];
								const previousValue = previousStats?.[key];
								const delta =
									value !== undefined && previousValue !== undefined
										? value - previousValue
										: undefined;

								return (
									<StatCard
										key={key}
										label={label}
										// 요청 실패·로딩 중인 날짜는 "-"
										value={
											value !== undefined
												? value.toLocaleString('ko-KR')
												: '-'
										}
										icon={icon}
										tone={tone}
										delta={delta}
									/>
								);
							})}
							{pair.length === 1 && <View style={styles.emptyCell} />}
						</View>
					))}
				</View>
			))}
		</ScrollView>
	);
};

export default AdminStats;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		content: {
			padding: PADDING,
		},
		dateNav: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			marginBottom: Spacing.l,
		},
		navButton: {
			width: 44,
			height: 44,
			alignItems: 'center',
			justifyContent: 'center',
		},
		group: {
			marginBottom: 28,
		},
		groupTitle: {
			marginBottom: Spacing.m,
		},
		cardRow: {
			flexDirection: 'row',
			gap: Spacing.s,
			marginBottom: Spacing.s,
		},
		emptyCell: {
			flex: 1,
		},
	});
