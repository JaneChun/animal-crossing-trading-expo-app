import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import AdminGuard from '@/components/Admin/AdminGuard';
import InfiniteList from '@/components/Admin/InfiniteList';
import ReportListItem from '@/components/Admin/ReportListItem';
import SanctionListItem from '@/components/Admin/SanctionListItem';
import { PADDING } from '@/components/ui/layout/Layout';
import Text from '@/components/ui/Text';
import { useAdminReports } from '@/hooks/admin/query/useAdminReports';
import { useStageSanctions } from '@/hooks/admin/query/useStageSanctions';
import {
	BorderRadius,
	FontSizes,
	FontWeights,
	Spacing,
	Theme,
	useTheme,
	useThemedStyles,
} from '@/theme';
import { SanctionReviewStage } from '@/types/sanction';

const Tab = createMaterialTopTabNavigator();

const STAGE_EMPTY_MESSAGES: Record<SanctionReviewStage, string> = {
	awaitingUser: '확인을 기다리는 조치가 없습니다.',
	awaitingReply: '답변할 이의 신청이 없습니다.',
	done: '처리 완료된 항목이 없습니다.',
};

// resolved: false → '검토 필요'(미처리 신고), true → '처리 완료 > 조치 없음'(조치 없이 끝낸 신고)
const ReportList = ({ resolved }: { resolved: boolean }) => {
	const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useAdminReports(resolved);

	return (
		<InfiniteList
			data={data}
			keyExtractor={(report) => report.id}
			renderItem={({ item }) => <ReportListItem report={item} />}
			isLoading={isLoading}
			isError={isError}
			hasNextPage={hasNextPage}
			isFetchingNextPage={isFetchingNextPage}
			fetchNextPage={fetchNextPage}
			emptyMessage={resolved ? '처리 완료된 항목이 없습니다.' : '검토할 신고가 없습니다.'}
			contentContainerStyle={styles.list}
		/>
	);
};

const SanctionList = ({ stage }: { stage: SanctionReviewStage }) => {
	const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useStageSanctions(stage);

	return (
		<InfiniteList
			data={data}
			keyExtractor={(sanction) => sanction.id}
			renderItem={({ item }) => <SanctionListItem sanction={item} meta="user" />}
			isLoading={isLoading}
			isError={isError}
			hasNextPage={hasNextPage}
			isFetchingNextPage={isFetchingNextPage}
			fetchNextPage={fetchNextPage}
			emptyMessage={STAGE_EMPTY_MESSAGES[stage]}
			contentContainerStyle={styles.list}
		/>
	);
};

type DoneFilter = 'sanction' | 'noSanction';

const DONE_FILTERS: { value: DoneFilter; label: string }[] = [
	{ value: 'sanction', label: '조치' },
	{ value: 'noSanction', label: '조치 없음' },
];

// '처리 완료' 탭: [조치]는 처리 완료 단계 조치, [조치 없음]은 조치 없이 끝낸 신고
const DoneList = () => {
	const themedStyles = useThemedStyles(makeStyles);
	const [filter, setFilter] = useState<DoneFilter>('sanction');

	return (
		<View style={styles.screen}>
			<View style={themedStyles.filters}>
				{DONE_FILTERS.map(({ value, label }) => {
					const isSelected = value === filter;
					return (
						<Pressable
							key={value}
							style={[
								themedStyles.filterChip,
								isSelected && themedStyles.selectedChip,
							]}
							onPress={() => setFilter(value)}
						>
							<Text
								variant="body2"
								weight="semibold"
								style={
									isSelected
										? themedStyles.selectedChipText
										: themedStyles.chipText
								}
							>
								{label}
							</Text>
						</Pressable>
					);
				})}
			</View>
			{filter === 'sanction' ? <SanctionList stage="done" /> : <ReportList resolved />}
		</View>
	);
};

const ReviewTab = () => <ReportList resolved={false} />;
const AwaitingUserTab = () => <SanctionList stage="awaitingUser" />;
const AwaitingReplyTab = () => <SanctionList stage="awaitingReply" />;

const AdminReports = () => {
	const { colors } = useTheme();

	return (
		<AdminGuard>
			<Tab.Navigator
				screenOptions={{
					tabBarLabelStyle: {
						fontSize: FontSizes.sm,
						fontWeight: FontWeights.semibold,
					},
					tabBarStyle: {
						backgroundColor: colors.bg.primary,
					},
					// 기본 배경은 내비게이션 테마의 회색이라 목록 좌우 여백에 드러난다
					sceneStyle: { backgroundColor: colors.bg.primary },
					tabBarIndicatorStyle: { backgroundColor: colors.brand.primary },
					tabBarActiveTintColor: colors.brand.primary,
					tabBarInactiveTintColor: colors.text.tertiary,
				}}
			>
				<Tab.Screen name="검토 필요" component={ReviewTab} />
				<Tab.Screen name="확인 대기" component={AwaitingUserTab} />
				<Tab.Screen name="답변 필요" component={AwaitingReplyTab} />
				<Tab.Screen name="처리 완료" component={DoneList} />
			</Tab.Navigator>
		</AdminGuard>
	);
};

export default AdminReports;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	list: {
		paddingHorizontal: PADDING,
	},
});

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		filters: {
			flexDirection: 'row',
			gap: 6,
			paddingTop: Spacing.m,
			paddingBottom: Spacing.xs,
			paddingHorizontal: PADDING,
		},
		// 앱의 카테고리 칩(Categories)과 같은 모양
		filterChip: {
			paddingVertical: Spacing.s,
			paddingHorizontal: 14,
			borderRadius: BorderRadius.full,
			backgroundColor: colors.bg.fill,
			borderWidth: 1,
			borderColor: colors.bg.fill,
		},
		selectedChip: {
			backgroundColor: colors.bg.primary,
			borderColor: colors.brand.primary,
		},
		chipText: {
			color: colors.text.tertiary,
		},
		selectedChipText: {
			color: colors.brand.primary,
		},
	});
