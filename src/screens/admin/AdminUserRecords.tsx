import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import AdminGuard from '@/components/Admin/AdminGuard';
import InfiniteList from '@/components/Admin/InfiniteList';
import ReportListItem from '@/components/Admin/ReportListItem';
import ReviewListItem from '@/components/Admin/ReviewListItem';
import UserIdRow from '@/components/Admin/UserIdRow';
import { PADDING } from '@/components/ui/layout/Layout';
import Text from '@/components/ui/Text';
import { useUserBlocks } from '@/hooks/admin/query/useUserBlocks';
import { useUserReports } from '@/hooks/admin/query/useUserReports';
import { useUserReviews } from '@/hooks/admin/query/useUserReviews';
import { FontSizes, FontWeights, Spacing, useTheme } from '@/theme';
import {
	AdminUserRecordKind,
	UserBlockDirection,
	UserReportDirection,
	UserReviewDirection,
} from '@/types/admin';
import { AdminUserRecordsRouteProp } from '@/types/navigation';
import { elapsedTime } from '@/utilities/elapsedTime';

const Tab = createMaterialTopTabNavigator();

const TITLES: Record<AdminUserRecordKind, string> = {
	reports: '신고 내역',
	reviews: '리뷰 내역',
	blocks: '차단 내역',
};

const ReportList = ({ uid, direction }: { uid: string; direction: UserReportDirection }) => {
	const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useUserReports(uid, direction);

	return (
		<InfiniteList
			data={data}
			keyExtractor={(report) => report.id}
			renderItem={({ item }) => <ReportListItem report={item} showResolvedBadge />}
			isLoading={isLoading}
			isError={isError}
			hasNextPage={hasNextPage}
			isFetchingNextPage={isFetchingNextPage}
			fetchNextPage={fetchNextPage}
			emptyMessage={
				direction === 'received' ? '받은 신고가 없습니다.' : '보낸 신고가 없습니다.'
			}
			contentContainerStyle={styles.reportList}
		/>
	);
};

const ReviewList = ({ uid, direction }: { uid: string; direction: UserReviewDirection }) => {
	const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useUserReviews(uid, direction);

	return (
		<InfiniteList
			data={data}
			keyExtractor={(review) => review.id}
			renderItem={({ item }) => (
				<ReviewListItem
					review={item}
					counterpartId={direction === 'received' ? item.senderId : item.receiverId}
				/>
			)}
			isLoading={isLoading}
			isError={isError}
			hasNextPage={hasNextPage}
			isFetchingNextPage={isFetchingNextPage}
			fetchNextPage={fetchNextPage}
			emptyMessage={
				direction === 'received' ? '받은 리뷰가 없습니다.' : '보낸 리뷰가 없습니다.'
			}
		/>
	);
};

const BlockList = ({ uid, direction }: { uid: string; direction: UserBlockDirection }) => {
	const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useUserBlocks(uid, direction);

	return (
		<InfiniteList
			data={data}
			keyExtractor={(block) => block.id}
			renderItem={({ item }) => (
				<UserIdRow
					uid={item.id}
					showSuspendedBadge
					right={
						<Text variant="caption" color="tertiary" style={styles.blockedAt}>
							{elapsedTime(item.blockedAt)}
						</Text>
					}
				/>
			)}
			isLoading={isLoading}
			isError={isError}
			hasNextPage={hasNextPage}
			isFetchingNextPage={isFetchingNextPage}
			fetchNextPage={fetchNextPage}
			emptyMessage={
				direction === 'blocking'
					? '차단한 유저가 없습니다.'
					: '이 유저를 차단한 유저가 없습니다.'
			}
		/>
	);
};

const AdminUserRecords = () => {
	const { colors } = useTheme();
	const { params } = useRoute<AdminUserRecordsRouteProp>();
	const { uid, kind } = params;
	const navigation = useNavigation();

	useEffect(() => {
		navigation.setOptions({ title: TITLES[kind] });
	}, [navigation, kind]);

	const renderTabs = () => {
		if (kind === 'reports') {
			return (
				<>
					<Tab.Screen name="받은 신고">
						{() => <ReportList uid={uid} direction="received" />}
					</Tab.Screen>
					<Tab.Screen name="보낸 신고">
						{() => <ReportList uid={uid} direction="sent" />}
					</Tab.Screen>
				</>
			);
		}
		if (kind === 'reviews') {
			return (
				<>
					<Tab.Screen name="받은 리뷰">
						{() => <ReviewList uid={uid} direction="received" />}
					</Tab.Screen>
					<Tab.Screen name="보낸 리뷰">
						{() => <ReviewList uid={uid} direction="sent" />}
					</Tab.Screen>
				</>
			);
		}
		return (
			<>
				<Tab.Screen name="차단한 유저">
					{() => <BlockList uid={uid} direction="blocking" />}
				</Tab.Screen>
				<Tab.Screen name="차단당한 유저">
					{() => <BlockList uid={uid} direction="blockedBy" />}
				</Tab.Screen>
			</>
		);
	};

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
				{renderTabs()}
			</Tab.Navigator>
		</AdminGuard>
	);
};

export default AdminUserRecords;

const styles = StyleSheet.create({
	// 신고 행은 좌우 여백이 없어 목록에서 준다. 유저 행(UserRow isListItem)은 행이 여백을 갖는다
	reportList: {
		paddingHorizontal: PADDING,
	},
	blockedAt: {
		alignSelf: 'flex-start',
		marginTop: Spacing.xs,
	},
});
