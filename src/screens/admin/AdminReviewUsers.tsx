import { StyleSheet, View } from 'react-native';

import AdminGuard from '@/components/Admin/AdminGuard';
import InfiniteList from '@/components/Admin/InfiniteList';
import UserRow from '@/components/Admin/UserRow';
import Badge from '@/components/ui/Badge';
import { PADDING } from '@/components/ui/layout/Layout';
import Text from '@/components/ui/Text';
import { useNeedsReviewUsers } from '@/hooks/admin/query/useNeedsReviewUsers';
import { Spacing, Theme, useThemedStyles } from '@/theme';
import {
	navigateToAdminAppealDetail,
	navigateToAdminUserDetail,
} from '@/utilities/navigationHelpers';

const AdminReviewUsers = () => {
	const styles = useThemedStyles(makeStyles);
	const { data, isLoading, isError } = useNeedsReviewUsers();

	return (
		<AdminGuard>
			<View style={styles.screen}>
				<Text variant="caption" color="tertiary" style={styles.description}>
					처리를 기다리는 이의 신청이나 처리되지 않은 신고가 있는 유저입니다.
				</Text>
				<InfiniteList
					data={data}
					keyExtractor={({ user }) => user.uid}
					renderItem={({
						item: { user, pendingAppealSanctionId, unresolvedReportCount },
					}) => (
						// 이의 신청 대기 중이면 이의 신청 상세로, 아니면 유저 상세로 간다
						<UserRow
							user={user}
							isListItem
							onPress={() =>
								pendingAppealSanctionId
									? navigateToAdminAppealDetail({
											sanctionId: pendingAppealSanctionId,
										})
									: navigateToAdminUserDetail({ uid: user.uid })
							}
							right={
								pendingAppealSanctionId ? (
									<Badge text="이의 신청" tone="brand" />
								) : (
									<Badge
										text={`미처리 신고 ${unresolvedReportCount}`}
										tone="orange"
									/>
								)
							}
						/>
					)}
					isLoading={isLoading}
					isError={isError}
					hasNextPage={false}
					isFetchingNextPage={false}
					fetchNextPage={() => {}}
					emptyMessage="검토가 필요한 유저가 없습니다."
				/>
			</View>
		</AdminGuard>
	);
};

export default AdminReviewUsers;

const makeStyles = ({ colors }: Theme) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.bg.primary,
		},
		description: {
			paddingVertical: Spacing.m,
			paddingHorizontal: PADDING,
			borderBottomWidth: 1,
			borderBottomColor: colors.border.default,
		},
	});
